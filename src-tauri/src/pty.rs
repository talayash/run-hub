use parking_lot::Mutex;
use portable_pty::{native_pty_system, CommandBuilder, PtySize, MasterPty, Child};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::thread;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessConfig {
    pub id: String,
    pub command: String,
    pub args: Vec<String>,
    pub working_dir: Option<String>,
    pub env: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProcessOutput {
    pub id: String,
    pub data: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProcessExit {
    pub id: String,
    pub code: Option<i32>,
}

struct PtyProcess {
    master: Box<dyn MasterPty + Send>,
    child: Box<dyn Child + Send + Sync>,
    writer: Box<dyn Write + Send>,
    spawn_id: u64,
}

pub struct PtyManager {
    processes: Mutex<HashMap<String, PtyProcess>>,
    spawn_counter: AtomicU64,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
            spawn_counter: AtomicU64::new(0),
        }
    }

    pub fn spawn_process(
        self: &Arc<Self>,
        app: AppHandle,
        config: ProcessConfig,
    ) -> Result<(), String> {
        let id = config.id.clone();

        // Kill existing process with the same ID if any
        {
            let mut processes = self.processes.lock();
            if let Some(mut existing) = processes.remove(&id) {
                let _ = existing.child.kill();
            }
        }

        let pty_system = native_pty_system();

        let pair = pty_system
            .openpty(PtySize {
                rows: 24,
                cols: 80,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to open PTY: {}", e))?;

        let mut cmd = CommandBuilder::new(&config.command);
        cmd.args(&config.args);

        if let Some(ref dir) = config.working_dir {
            cmd.cwd(dir);
        }

        for (key, value) in &config.env {
            cmd.env(key, value);
        }

        let child = pair.slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn process: {}", e))?;

        let reader = pair.master
            .try_clone_reader()
            .map_err(|e| format!("Failed to clone reader: {}", e))?;

        let writer = pair.master
            .take_writer()
            .map_err(|e| format!("Failed to take writer: {}", e))?;

        // Generate unique spawn_id for this process instance
        let spawn_id = self.spawn_counter.fetch_add(1, Ordering::SeqCst);

        let process = PtyProcess {
            master: pair.master,
            child,
            writer,
            spawn_id,
        };

        self.processes.lock().insert(id.clone(), process);

        // Spawn reader thread with reference to manager for spawn_id validation
        let manager = Arc::clone(self);
        thread::spawn(move || {
            Self::read_output(app, id, spawn_id, reader, manager);
        });

        Ok(())
    }

    fn read_output(
        app: AppHandle,
        id: String,
        spawn_id: u64,
        mut reader: Box<dyn Read + Send>,
        manager: Arc<Self>,
    ) {
        let mut buffer = [0u8; 4096];
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(n) => {
                    // Check if this reader is still valid (process hasn't been replaced)
                    let is_valid = manager.processes.lock()
                        .get(&id)
                        .map(|p| p.spawn_id == spawn_id)
                        .unwrap_or(false);

                    if !is_valid {
                        // Process was killed or replaced, stop reading
                        // Don't emit pty-exit here - kill_process handles it for kills,
                        // and for replacements we don't want to emit at all
                        return;
                    }

                    let data = String::from_utf8_lossy(&buffer[..n]).to_string();
                    let _ = app.emit("pty-output", ProcessOutput {
                        id: id.clone(),
                        data,
                    });
                }
                Err(_) => break,
            }
        }

        // Only emit exit if this spawn_id is still the current one
        // If process was removed (killed or replaced), don't emit - kill_process handles it
        let should_emit = manager.processes.lock()
            .get(&id)
            .map(|p| p.spawn_id == spawn_id)
            .unwrap_or(false);

        if should_emit {
            // Process exited naturally, remove from HashMap and emit exit
            manager.processes.lock().remove(&id);
            let _ = app.emit("pty-exit", ProcessExit {
                id: id.clone(),
                code: None,
            });
        }
    }

    pub fn write_to_process(&self, id: &str, data: &str) -> Result<(), String> {
        let mut processes = self.processes.lock();
        if let Some(process) = processes.get_mut(id) {
            process.writer
                .write_all(data.as_bytes())
                .map_err(|e| format!("Failed to write to process: {}", e))?;
            process.writer
                .flush()
                .map_err(|e| format!("Failed to flush: {}", e))?;
            Ok(())
        } else {
            Err(format!("Process {} not found", id))
        }
    }

    pub fn resize_pty(&self, id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let processes = self.processes.lock();
        if let Some(process) = processes.get(id) {
            process.master
                .resize(PtySize {
                    rows,
                    cols,
                    pixel_width: 0,
                    pixel_height: 0,
                })
                .map_err(|e| format!("Failed to resize PTY: {}", e))?;
            Ok(())
        } else {
            Err(format!("Process {} not found", id))
        }
    }

    pub fn kill_process(&self, id: &str, app: &AppHandle) -> Result<(), String> {
        let mut processes = self.processes.lock();
        if let Some(mut process) = processes.remove(id) {
            process.child
                .kill()
                .map_err(|e| format!("Failed to kill process: {}", e))?;

            // Emit exit event so frontend knows the process was killed
            let _ = app.emit("pty-exit", ProcessExit {
                id: id.to_string(),
                code: None,
            });
            Ok(())
        } else {
            Err(format!("Process {} not found", id))
        }
    }

    pub fn is_running(&self, id: &str) -> bool {
        self.processes.lock().contains_key(id)
    }
}

impl Default for PtyManager {
    fn default() -> Self {
        Self::new()
    }
}
