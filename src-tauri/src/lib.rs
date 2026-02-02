mod config;
mod pty;

use config::{AppConfig, load_config, save_config};
use pty::{ProcessConfig, PtyManager};
use std::sync::Arc;
use tauri::{AppHandle, State};

struct AppState {
    pty_manager: Arc<PtyManager>,
}

#[tauri::command]
async fn spawn_process(
    app: AppHandle,
    state: State<'_, AppState>,
    config: ProcessConfig,
) -> Result<(), String> {
    PtyManager::spawn_process(&state.pty_manager, app, config)
}

#[tauri::command]
async fn write_to_process(
    state: State<'_, AppState>,
    id: String,
    data: String,
) -> Result<(), String> {
    state.pty_manager.write_to_process(&id, &data)
}

#[tauri::command]
async fn resize_pty(
    state: State<'_, AppState>,
    id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    state.pty_manager.resize_pty(&id, cols, rows)
}

#[tauri::command]
async fn kill_process(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    state.pty_manager.kill_process(&id, &app)
}

#[tauri::command]
async fn is_process_running(
    state: State<'_, AppState>,
    id: String,
) -> Result<bool, String> {
    Ok(state.pty_manager.is_running(&id))
}

#[tauri::command]
async fn get_config() -> Result<AppConfig, String> {
    load_config()
}

#[tauri::command]
async fn set_config(config: AppConfig) -> Result<(), String> {
    save_config(&config)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            pty_manager: Arc::new(PtyManager::new()),
        })
        .invoke_handler(tauri::generate_handler![
            spawn_process,
            write_to_process,
            resize_pty,
            kill_process,
            is_process_running,
            get_config,
            set_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
