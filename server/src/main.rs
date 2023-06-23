use std::sync::{Arc, Mutex};

use actix::{Actor, StreamHandler};
use actix_web::{get, middleware::Logger, web, App, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use env_logger::Env;
use log::info;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
enum MessageType {
    UserConnect,
    UserDisconnect,
    Text,
    Error,
}

#[derive(Debug, Serialize, Deserialize)]
struct Message {
    message_type: MessageType,
    payload: String,
}

impl Message {
    fn error(error_message: &str) -> Message {
        Message {
            message_type: MessageType::Error,
            payload: error_message.to_string(),
        }
    }

    fn serde_error(error_message: &str) -> String {
        let error = Message::error(error_message);

        serde_json::to_string(&error).unwrap()
    }
}

#[derive(Debug)]
pub struct User {
    pub user_id: u32,
    pub username: String,
}

impl User {
    fn new(user_id: u32, username: String) -> Self {
        Self { user_id, username }
    }
}

struct MyWs {
    users: Arc<Mutex<Vec<User>>>,
}

impl MyWs {
    fn new(users: Arc<Mutex<Vec<User>>>) -> Self {
        Self { users }
    }
}

impl Actor for MyWs {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWs {
    fn handle(&mut self, item: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        if let Ok(ws::Message::Text(text)) = item {
            if let Ok(message) = serde_json::from_str::<Message>(&text) {
                info!("Message: {message:?}");
                match message.message_type {
                    MessageType::UserConnect => {
                        let user =
                            User::new(self.users.lock().unwrap().len() as u32, message.payload);
                        self.users.lock().unwrap().push(user);
                    }
                    MessageType::Text => {}
                    _ => ctx.text(Message::serde_error("Unknown message received")),
                }
            } else {
                ctx.text(Message::serde_error("Failed to extract text"))
            }
        }
    }
}

#[get("/ws")]
async fn web_socket(
    request: HttpRequest,
    stream: web::Payload,
    data: web::Data<AppState>,
) -> Result<HttpResponse, actix_web::Error> {
    let host = request
        .headers()
        .get("host")
        .map(|h| h.to_str().unwrap_or(""))
        .unwrap();
    let ip = request.connection_info().peer_addr().unwrap().to_owned();
    let time = chrono::Local::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
    info!("Websockets connection established with host ({host:?}) and ip ({ip}) - {time}");
    ws::start(MyWs::new(data.users.clone()), &request, stream)
}

struct AppState {
    users: Arc<Mutex<Vec<User>>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            users: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("debug"));
    let app_state = web::Data::new(AppState::new());
    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(app_state.clone())
            .service(web_socket)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
