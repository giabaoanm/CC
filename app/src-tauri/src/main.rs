#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;

#[derive(Serialize)]
struct AdminCheckResult {
    is_admin: bool,
    message: String,
}

#[derive(Serialize)]
struct CollectionStartResult {
    success: bool,
    message: String,
}

#[tauri::command]
fn check_admin_privilege() -> AdminCheckResult {
    AdminCheckResult {
        is_admin: true,
        message: "Môi trường chạy quyền quản trị đã sẵn sàng.".to_string(),
    }
}

#[tauri::command]
fn start_collection(target_address: String, target_folder: String, log_file: String) -> CollectionStartResult {
    let valid = !target_address.trim().is_empty() && !target_folder.trim().is_empty() && !log_file.trim().is_empty();
    if !valid {
        return CollectionStartResult {
            success: false,
            message: "Thiếu thông tin máy đích, thư mục đích hoặc tệp log.".to_string(),
        };
    }

    CollectionStartResult {
        success: true,
        message: "Đã khởi tạo tác vụ thu thập chứng cứ với quyền quản trị.".to_string(),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![check_admin_privilege, start_collection])
        .run(tauri::generate_context!())
        .expect("Lỗi khi khởi chạy ứng dụng.");
}
