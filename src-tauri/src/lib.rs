mod logger;
use std::env;

#[tauri::command]
fn dira() -> Result<String, String> {
    Ok(env::current_dir().unwrap().to_str().unwrap().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![dira])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
