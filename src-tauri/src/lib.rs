use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

use tokio::fs;
use tokio::io::AsyncWriteExt;
use std::path::Path;
use futures::StreamExt; 

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn save_video(video_path: &str, folder_path: &str) -> Result<String, String> {
    // Create the target folder if it doesn't exist
    fs::create_dir_all(folder_path).await.map_err(|e| e.to_string())?;
    
    // Get the filename from the video_path
    let filename = Path::new(video_path)
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or("Invalid filename")?;
    
    // Construct the target path
    let target_path = Path::new(folder_path).join(filename);
    
    // Create a TCP connection and download the file
    let response = reqwest::get(video_path)
        .await
        .map_err(|e| e.to_string())?;
    
    // Create file and write to it asynchronously
    let mut file = fs::File::create(&target_path)
        .await
        .map_err(|e| e.to_string())?;
    
    let mut stream = response.bytes_stream();
    
    // Use tokio's async file operations
    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| e.to_string())?;
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;
    }
    
    file.flush().await.map_err(|e| e.to_string())?;
    
    Ok(String::from("Finished"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("")
                .inner_size(1200.0, 800.0);

            // set transparent title bar only when building for macOS
            #[cfg(target_os = "macos")]
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);

            let window = win_builder.build().unwrap();

            // set background color only when building for macOS
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSColor, NSWindow};
                use cocoa::base::{id, nil};

                let ns_window = window.ns_window().unwrap() as id;
                unsafe {
                    let bg_color = NSColor::colorWithRed_green_blue_alpha_(
                        nil,
                        0.0,
                        0.0,
                        0.0,
                        1.0,
                    );
                    ns_window.setBackgroundColor_(bg_color);
                }
            }

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, save_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
