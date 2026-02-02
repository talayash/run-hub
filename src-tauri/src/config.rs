use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RunConfig {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub config_type: String,
    pub command: Option<String>,
    pub working_dir: Option<String>,
    pub env: HashMap<String, String>,
    pub args: Vec<String>,
    pub folder_id: Option<String>,
    pub color: Option<String>,
    pub auto_restart: bool,
    pub restart_delay: u32,
    pub max_retries: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub expanded: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub configs: Vec<RunConfig>,
    pub folders: Vec<Folder>,
    pub config_order: Vec<String>,
}

fn get_config_path() -> PathBuf {
    let app_data = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."));
    app_data.join("RunDeck").join("config.json")
}

pub fn load_config() -> Result<AppConfig, String> {
    let path = get_config_path();

    if !path.exists() {
        return Ok(AppConfig::default());
    }

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read config: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))
}

pub fn save_config(config: &AppConfig) -> Result<(), String> {
    let path = get_config_path();

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    let temp_path = path.with_extension("json.tmp");
    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&temp_path, content)
        .map_err(|e| format!("Failed to write config: {}", e))?;

    fs::rename(&temp_path, &path)
        .map_err(|e| format!("Failed to rename config file: {}", e))?;

    Ok(())
}
