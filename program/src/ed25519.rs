// from https://github.com/stegaBOB/solana_ed25519_verify/blob/main/src/lib.rs

use crate::error::Error;
use arrayref::array_ref;
use curve25519_dalek::Scalar;
use sha2::{Digest, Sha512};
use solana_program::{entrypoint::ProgramResult, pubkey::Pubkey};
use solana_zk_token_sdk::curve25519::{
    edwards::{multiply_edwards, subtract_edwards, validate_edwards, PodEdwardsPoint},
    scalar::PodScalar,
};

const EDWARDS_BASE_POINT: PodEdwardsPoint = PodEdwardsPoint([
    0x58, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66,
    0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66,
]);

pub(crate) fn verify_signature(
    pubkey: &Pubkey,
    signature: &[u8; 64],
    message: &[u8],
) -> ProgramResult {
    let a = PodEdwardsPoint(pubkey.to_bytes());
    let r = PodEdwardsPoint(*array_ref![signature, 0, 32]);
    if !validate_edwards(&a) {
        return Err(Error::SignatureMismatch.into());
    }
    if !validate_edwards(&r) {
        return Err(Error::SignatureMismatch.into());
    }

    let s = array_ref![signature, 32, 32];
    let s_scalar = PodScalar(Scalar::from_bytes_mod_order(*s).to_bytes());

    let mut hasher = Sha512::new();
    hasher.update(r.0);
    hasher.update(a.0);
    hasher.update(message);
    let hash_bytes = hasher.finalize();
    let hash_array = array_ref![hash_bytes, 0, 64];
    let h_scalar = PodScalar(Scalar::from_bytes_mod_order_wide(hash_array).to_bytes());

    let s_b = multiply_edwards(&s_scalar, &EDWARDS_BASE_POINT).unwrap();
    let h_a = multiply_edwards(&h_scalar, &a).unwrap();
    let r_prime = subtract_edwards(&s_b, &h_a).unwrap();

    if r_prime == r {
        Ok(())
    } else {
        Err(Error::SignatureMismatch.into())
    }
}
