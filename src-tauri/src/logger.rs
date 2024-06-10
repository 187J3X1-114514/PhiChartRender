use lazy_static::lazy_static;
use std::fs::OpenOptions;
use std::io::Write;
use std::sync::{Arc, RwLock};

#[allow(dead_code)]
pub struct Logger {
    log_file: Arc<RwLock<std::fs::File>>,
}

#[allow(dead_code)]
impl Logger {
    fn new(log_file: std::fs::File) -> Self {
        Self {
            log_file: Arc::new(RwLock::new(log_file)),
        }
    }

    fn log(&self, message: &str) {
        let mut file = self.log_file.write().unwrap();
        file.write_all(message.as_bytes()).unwrap();
    }
}

lazy_static! {
    static ref LOGGER: Arc<Logger> = {
        let log_file = OpenOptions::new()
            .create(true)
            .write(true)
            .truncate(true)
            .open("log.txt")
            .unwrap();

        Arc::new(Logger::new(log_file))
    };
}

pub fn init(log_filename: &str) {
    let log_file = OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(log_filename)
        .unwrap();

    *LOGGER.log_file.write().unwrap() = log_file;
}

pub fn log(msg: &str) {
    LOGGER.log(msg);
}
