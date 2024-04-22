use std::fmt::Display;
use sea_orm::{entity::prelude::*, Set};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "txs")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub signature: Vec<u8>,
    pub slot: i64,
    pub error: Option<String>,
    pub logs: serde_json::Value,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

pub fn new<T: Display>(slot: u64, signature: Vec<u8>, err: Option<T>, logs: Vec<String>) -> ActiveModel {
    ActiveModel {
        slot: Set(slot as i64),
        signature: Set(signature),
        error: Set(err.map(|e| e.to_string())),
        logs: Set(serde_json::json!(logs)),
    }
}
