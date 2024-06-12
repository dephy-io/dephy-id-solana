use solana_program::pubkey::Pubkey;

pub fn find_device(
    owner: &Pubkey,
    program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            b"DEVICE",
            owner.as_ref(),
        ],
        program_id,
    )
}
