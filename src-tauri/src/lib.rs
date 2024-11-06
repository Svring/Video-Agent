// use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};
use tauri::{WebviewUrl, WebviewWindowBuilder};

use std::path::Path;
use tauri_plugin_dialog::DialogExt;
use tokio::fs;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn select_folder(app: tauri::AppHandle) -> Result<String, String> {
    let file_path = app.dialog().file().blocking_pick_folder();
    match file_path {
        Some(path) => Ok(path.to_string()),
        None => Err("No folder selected".to_string()),
    }
}

#[tauri::command]
async fn save_video(video_path: String, folder_path: String) -> Result<String, String> {
    // Get the next filename
    let new_filename = get_next_filename(&folder_path).await?;

    // Construct the target path
    let target_path = Path::new(&folder_path).join(format!("{}.mp4", new_filename));

    // Download and save the video
    let response = reqwest::get(&video_path).await.map_err(|e| e.to_string())?;

    fs::File::create(&target_path)
        .await
        .map_err(|e| e.to_string())?;

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    fs::write(&target_path, bytes)
        .await
        .map_err(|e| e.to_string())?;

    Ok(new_filename)
}

#[tauri::command]
async fn get_next_filename(folder_path: &str) -> Result<String, String> {
    let mut highest_num = -1;

    let base_name = Path::new(&folder_path)
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or("Invalid folder path")?;

    let mut dir = fs::read_dir(&folder_path)
        .await
        .map_err(|e| e.to_string())?;

    // Find highest number
    while let Ok(Some(entry)) = dir.next_entry().await {
        if let Some(filename) = entry.file_name().to_str() {
            // Remove .mp4 extension if present
            let filename = filename.strip_suffix(".mp4").unwrap_or(filename);
            if filename.starts_with(base_name) {
                if let Some(num_str) = filename.split('-').last() {
                    if let Ok(num) = num_str.trim().parse::<i32>() {
                        highest_num = highest_num.max(num);
                    }
                }
            }
        }
    }

    // Generate next filename
    Ok(format!("{}-{}", base_name, highest_num + 1))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("")
                .inner_size(1200.0, 800.0);

            // set transparent title bar only when building for macOS
            // #[cfg(target_os = "macos")]
            // let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);

            let window = win_builder.build().unwrap();

            // set background color only when building for macOS
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSColor, NSWindow};
                use cocoa::base::{id, nil};

                let ns_window = window.ns_window().unwrap() as id;
                unsafe {
                    let bg_color = NSColor::colorWithRed_green_blue_alpha_(nil, 0.0, 0.0, 0.0, 1.0);
                    ns_window.setBackgroundColor_(bg_color);
                }
            }

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, save_video, select_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
