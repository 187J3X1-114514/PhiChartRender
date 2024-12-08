
#[cfg(target_os = "windows")]
mod windows_utils {
    use super::*;

    use winapi::shared::minwindef::{FALSE, TRUE};
    use winapi::shared::windef::{HGDIOBJ, HWND, RECT};
    use winapi::um::dwmapi::{
        DwmEnableBlurBehindWindow, DwmSetWindowAttribute, DWM_BB_BLURREGION, DWM_BB_ENABLE,
    };
    use winapi::um::wingdi::{CreateRectRgn, DeleteObject};
    use winapi::um::winuser::GetWindowRect;

    pub fn set_theme(hwnd: HWND, mut mode: c_int) {
        unsafe {
            DwmSetWindowAttribute(hwnd, 20, &mut mode as *mut _ as *mut _, 4);
        }
    }

    pub fn set_wa(hwnd: HWND, attribute: c_int, value: c_int) {
        let mut value_ref = value;
        unsafe {
            DwmSetWindowAttribute(
                hwnd,
                attribute.try_into().unwrap(),
                &mut value_ref as *mut _ as *mut _,
                4,
            );
        }
    }

    pub fn set_transparency(window: HWND, os_version: c_int) -> bool {
        unsafe {
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
}

use chrono::prelude::*;
use cty::c_int;
use std::path::PathBuf;
use tauri::Manager;
use tauri_plugin_log::Target;
use tauri_plugin_log::TargetKind;

#[tauri::command]
fn set_theme(hwnd: i32, mode: i8) {
    #[cfg(target_os = "windows")]
    {
        use winapi::shared::windef::HWND;
        windows_utils::set_theme(hwnd as HWND, mode as c_int);
    }
}

#[tauri::command]
fn set_wa(hwnd: i32, attribute: i32, value: i32) {
    #[cfg(target_os = "windows")]
    {
        use winapi::shared::windef::HWND;
        windows_utils::set_wa(hwnd as HWND, attribute as c_int, value as c_int);
    }
}

#[tauri::command]
fn set_transparency(window_: i32, winves: i8) -> bool {
    #[cfg(target_os = "windows")]
    {
        use winapi::shared::windef::HWND;
        windows_utils::set_transparency(window_ as HWND, winves as c_int);
    }
    return true;
}

#[tauri::command]
fn get_window_handle(window: tauri::Window) -> Result<i64, String> {
    let mut _handle = 0;
    #[cfg(target_os = "windows")]
    {
        _handle = window.hwnd().unwrap().0 as i64;
    }
    Ok(_handle)
}

#[tauri::command]
fn get_theme() -> i32 {
    #[cfg(target_os = "windows")]
    {
        let mode = dark_light::detect();

        match mode {
            // Dark mode
            dark_light::Mode::Dark => return 0,
            // Light mode
            dark_light::Mode::Light => return 1,
            // Unspecified
            dark_light::Mode::Default => return 2,
        }
    }
    2
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        //.plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                //.targets([
                //    Target::new(TargetKind::Stdout),
                //    Target::new(TargetKind::Folder {
                //        path: PathBuf::from("./logs"),
                //        file_name: Some(Local::now().format("%Y-%m-%d %H.%M.%S").to_string()),
                //    }),
                //])
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            set_theme,
            set_wa,
            set_transparency,
            get_window_handle,
            get_theme
        ])
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                app.get_webview_window("main").unwrap().open_devtools();
                //app.get_webview_window("main").unwrap().set_background_color(Some([0,0,0,0].into()));
                //app.get_window("main").unwrap().set_background_color(Some([0,0,0,0].into()));
                //app.get_window()
                //app.get_webview_window("main").unwrap().g
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
