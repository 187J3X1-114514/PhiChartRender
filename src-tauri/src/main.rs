// Prevents additional console window on Windows in release, DO REMOVE!!
//#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
extern crate cty;
extern crate winapi;
extern crate windows;
extern crate chrono;
use cty::c_int;
use winapi::shared::minwindef::{FALSE, TRUE, UINT};
use winapi::shared::ntdef::HRESULT;
use winapi::shared::windef::{HGDIOBJ, HWND, RECT};
use winapi::um::dwmapi::{
    DwmEnableBlurBehindWindow, DwmSetWindowAttribute, DWM_BB_BLURREGION, DWM_BB_ENABLE,
};
use winapi::um::wingdi::{CreateRectRgn, DeleteObject};
use winapi::um::winuser::GetWindowRect;
use tauri_plugin_log::{Target, TargetKind};
use chrono::prelude::*;
use std::path::PathBuf;
use tauri::Manager;
#[tauri::command]
fn set_theme(hwnd: i32, mode: i8) -> HRESULT {
    let h = hwnd as HWND;
    let mut value = mode as c_int;
    unsafe { DwmSetWindowAttribute(h, 20, &mut value as *mut _ as *mut _, 4) }
}
#[tauri::command]
fn set_wa(hwnd: i32, attribute: UINT, value: UINT) -> HRESULT {
    let h = hwnd as HWND;
    let mut value_ref = value;
    unsafe { DwmSetWindowAttribute(h, attribute, &mut value_ref as *mut _ as *mut _, 4) }
}

#[tauri::command]
fn set_transparency(window_: i32, winves: i8) -> bool {
    let window = window_ as HWND;
    unsafe {
        let os_version = winves;
        if os_version > 7 {
            // Windows 8 or higher
            let mut rect: RECT = std::mem::zeroed();
            GetWindowRect(window, &mut rect);
            let region = CreateRectRgn(0, 0, -1, -1);
            let mut bb = winapi::um::dwmapi::DWM_BLURBEHIND {
                dwFlags: DWM_BB_ENABLE | DWM_BB_BLURREGION,
                fEnable: TRUE,
                hRgnBlur: region,
                fTransitionOnMaximized: FALSE,
            };
            let result = DwmEnableBlurBehindWindow(window, &mut bb);
            DeleteObject(region as HGDIOBJ);
            result == TRUE
        } else {
            let bb = winapi::um::dwmapi::DWM_BLURBEHIND {
                dwFlags: DWM_BB_ENABLE,
                fEnable: TRUE,
                hRgnBlur: std::ptr::null_mut(),
                fTransitionOnMaximized: FALSE,
            };
            DwmEnableBlurBehindWindow(window, &bb) == TRUE
        }
    }
}
#[tauri::command]
fn get_window_handle(window: tauri::Window) -> Result<i32, String> {
    let handle = window.hwnd().map_err(|e| e.to_string())?;
    Ok(handle.0 as i32)
}

#[tauri::command]
fn get_theme() -> i32{
    let mut mode_int = 0;
    let mode = dark_light::detect();
    
    match mode {
        // Dark mode
        dark_light::Mode::Dark => {
            mode_int = 0;
        },
        // Light mode
        dark_light::Mode::Light => {
            mode_int = 1;
        },
        // Unspecified
        dark_light::Mode::Default => {
            mode_int = 2;
        },
    }
    return mode_int;
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::Folder { path: PathBuf::from("./logs"), file_name: Some(Local::now().second().to_string()) }),
                ])
                .build(),
        )
        //.plugin(
        //    tauri_plugin_localhost::Builder::new(64)
        //        .on_request(|_req, resp| {
        //            resp.add_header("Cross-Origin-Opener-Policy", "same-origin");
        //            resp.add_header("Cross-Origin-Embedder-Policy", "require-corp");
        //        })
        //        .build(),
        //)
        .invoke_handler(tauri::generate_handler![
            set_theme,
            set_wa,
            set_transparency,
            get_window_handle,
            get_theme
        ])
        //.setup(|app| {
        //    tauri::WebviewWindowBuilder::new(
        //        app,
        //        "main",
        //        tauri::WebviewUrl::App("index.html".into()),
        //    )
        //    .on_web_resource_request(|req, resp| {
        //        resp.headers_mut().insert(
        //          "Cross-Origin-Opener-Policy",
        //          "same-origin".try_into().unwrap(),
        //        );
        //        resp.headers_mut().insert(
        //          "Cross-Origin-Embedder-Policy",
        //          "require-corp".try_into().unwrap(),
        //        );
        //        println!("headers inserted");
        //    
        //    })
        //    .transparent(true)
        //    .resizable(true)
        //    .title("Phigros Simulator Plus+++++++++++++")
        //    .inner_size(1280.0, 720.0)
        //    .build()?;
        //    Ok(())
        //})
        .setup(|app| {
            app.get_webview_window("main").unwrap().open_devtools();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
