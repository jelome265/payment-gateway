mod matching_engine;

use matching_engine::{Order, Orderbook, Side, Trade};
use tokio::sync::mpsc;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

enum Message {
    SubmitOrder(Order, mpsc::Sender<Vec<Trade>>),
}

async fn orderbook_actor(mut book: Orderbook, mut rx: mpsc::Receiver<Message>) {
    info!("Orderbook actor started for {}", book.pair);
    while let Some(msg) = rx.recv().await {
        match msg {
            Message::SubmitOrder(order, response_tx) => {
                let trades = book.submit_order(order);
                if let Err(e) = response_tx.send(trades).await {
                    eprintln!("Failed to send response: {}", e);
                }
            }
        }
    }
}

#[tokio::main]
async fn main() {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    let (tx, rx) = mpsc::channel(100);
    let book = Orderbook::new("USD/MWK");
    
    tokio::spawn(orderbook_actor(book, rx));

    // Example: Submit a sell order
    let (resp_tx, mut resp_rx) = mpsc::channel(1);
    let sell_order = Order {
        id: "s1".into(),
        user_id: "seller1".into(),
        side: Side::Sell,
        price: 10000000,
        quantity: 10000,
        remaining: 10000,
        timestamp: 0,
    };
    
    tx.send(Message::SubmitOrder(sell_order, resp_tx)).await.unwrap();
    let trades = resp_rx.recv().await.unwrap();
    info!("Sell order submitted, trades: {:?}", trades);

    // Example: Submit a matching buy order
    let (resp_tx, mut resp_rx) = mpsc::channel(1);
    let buy_order = Order {
        id: "b1".into(),
        user_id: "buyer1".into(),
        side: Side::Buy,
        price: 10000000,
        quantity: 10000,
        remaining: 10000,
        timestamp: 0,
    };

    tx.send(Message::SubmitOrder(buy_order, resp_tx)).await.unwrap();
    let trades = resp_rx.recv().await.unwrap();
    info!("Buy order matched, trades produced: {:?}", trades);
}
