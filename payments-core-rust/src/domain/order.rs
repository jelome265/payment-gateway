pub struct Order {
    pub id: String,
    pub user_id: String,
    pub pair: String, // e.g., "USD/MWK"
    pub side: OrderSide,
    pub amount: f64,
    pub rate: f64,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum OrderSide {
    Buy,
    Sell,
}

impl Order {
    pub fn new(id: String, user_id: String, pair: String, side: OrderSide, amount: f64, rate: f64) -> Self {
        Self { id, user_id, pair, side, amount, rate }
    }
}
