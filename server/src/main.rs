use actix::{Actor, StreamHandler};
use actix_web::{
    get, middleware::Logger, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
};
use actix_web_actors::ws;
use env_logger::Env;
use log::info;

#[get("/")]
async fn hello() -> impl Responder {
    "Hello world".to_owned()
}

struct MyWs;

impl Actor for MyWs {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWs {
    fn handle(&mut self, item: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        if let Ok(ws::Message::Text(text)) = item {
            info!("Text received from websockets connection: {text}");
            ctx.text(text)
        }
    }
}

#[get("/ws")]
async fn web_socket(
    request: HttpRequest,
    stream: web::Payload,
) -> Result<HttpResponse, actix_web::Error> {
    if let Some(host) = request.headers().get("host") {
        info!("Websockets connection established with host: {:?}", host);
    } else {
        info!("Websockets connection established");
    }
    ws::start(MyWs, &request, stream)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .service(hello)
            .service(web_socket)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
