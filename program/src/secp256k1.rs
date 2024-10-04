use crate::error::Error;
use solana_program::{
    entrypoint::ProgramResult, keccak, msg, pubkey::Pubkey, secp256k1_recover::secp256k1_recover,
};

pub(crate) fn verify_signature(
    pubkey: &Pubkey,
    signature: &[u8; 64],
    recovery_id: u8,
    message: &[u8],
) -> ProgramResult {
    let message_hash = keccak::hash(message);

    {
        let signature = libsecp256k1::Signature::parse_standard(signature)
            .map_err(|_| Error::SignatureMismatch)?;

        if signature.s.is_high() {
            return Err(Error::SignatureMismatch.into());
        }
    }

    let recovered_pubkey = secp256k1_recover(&message_hash.0, recovery_id, signature)
        .map_err(|_| Error::SignatureMismatch)?;

    let mapped_pubkey = keccak::hash(recovered_pubkey.0.as_ref());
    if mapped_pubkey.as_ref() != pubkey.as_ref() {
        msg!("{:?} != {:?}", mapped_pubkey, pubkey);
        return Err(Error::SignatureMismatch.into());
    }

    Ok(())
}
