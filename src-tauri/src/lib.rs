mod commands;
mod external_backup;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
      commands::list_unbearbeitet,
      commands::read_pdf_bytes,
      commands::read_eingang_pdf_bytes,
      commands::eingang_pdf_exists,
      commands::move_to_eingang,
      commands::move_to_custom_folder,
      commands::run_ocr_placeholder,
      commands::make_searchable_pdf,
      commands::bank_speichern,
      commands::bank_datei_oeffnen,
      commands::bank_datei_oeffnen_bytes,
      commands::list_eingang_belege,
      commands::belege_laden,
      commands::belege_speichern,
      commands::jahresdatei_laden,
      commands::jahresdatei_speichern,
      commands::jahresdatei_backup_erstellen,
      commands::jahresdatei_backup_restore,
      commands::jahresdatei_backup_status,
      commands::pdf_im_system_oeffnen,
      commands::relpath_pdf_exists,
      commands::read_pdf_bytes_by_relpath,
      commands::open_file_extern,
      external_backup::run_external_backup
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}