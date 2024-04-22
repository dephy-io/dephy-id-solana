use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Txs::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Txs::Signature)
                            .binary()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Txs::Slot).big_integer().not_null())
                    .col(ColumnDef::new(Txs::Error).text())
                    .col(ColumnDef::new(Txs::Logs).json_binary().not_null())
                    .to_owned(),
            )
            .await?;

        // manager
        //     .create_index(
        //         Index::create()
        //             .table(Txs::Table)
        //             .if_not_exists()
        //             .col(Txs::Slot)
        //             .to_owned(),
        //     ).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Txs::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Txs {
    Table,
    Signature,
    Slot,
    Error,
    Logs,
}
