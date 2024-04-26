//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct CreateDephy {
    /// The system program
    pub system_program: solana_program::pubkey::Pubkey,
    /// The account paying for the storage fees
    pub payer: solana_program::pubkey::Pubkey,
    /// The address of the DePHY account
    pub dephy: solana_program::pubkey::Pubkey,
    /// The authority of the DePHY account
    pub authority: solana_program::pubkey::Pubkey,
}

impl CreateDephy {
    pub fn instruction(
        &self,
        args: CreateDephyInstructionArgs,
    ) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(args, &[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        args: CreateDephyInstructionArgs,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(4 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.payer, true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.dephy, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.authority,
            true,
        ));
        accounts.extend_from_slice(remaining_accounts);
        let mut data = borsh::to_vec(&CreateDephyInstructionData::new()).unwrap();
        let mut args = borsh::to_vec(&args).unwrap();
        data.append(&mut args);

        solana_program::instruction::Instruction {
            program_id: crate::DEPHY_ID_ID,
            accounts,
            data,
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateDephyInstructionData {
    discriminator: u8,
}

impl CreateDephyInstructionData {
    pub fn new() -> Self {
        Self { discriminator: 0 }
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct CreateDephyInstructionArgs {
    pub bump: u8,
}

/// Instruction builder for `CreateDephy`.
///
/// ### Accounts:
///
///   0. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   1. `[writable, signer]` payer
///   2. `[writable]` dephy
///   3. `[signer]` authority
#[derive(Clone, Debug, Default)]
pub struct CreateDephyBuilder {
    system_program: Option<solana_program::pubkey::Pubkey>,
    payer: Option<solana_program::pubkey::Pubkey>,
    dephy: Option<solana_program::pubkey::Pubkey>,
    authority: Option<solana_program::pubkey::Pubkey>,
    bump: Option<u8>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl CreateDephyBuilder {
    pub fn new() -> Self {
        Self::default()
    }
    /// `[optional account, default to '11111111111111111111111111111111']`
    /// The system program
    #[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.system_program = Some(system_program);
        self
    }
    /// The account paying for the storage fees
    #[inline(always)]
    pub fn payer(&mut self, payer: solana_program::pubkey::Pubkey) -> &mut Self {
        self.payer = Some(payer);
        self
    }
    /// The address of the DePHY account
    #[inline(always)]
    pub fn dephy(&mut self, dephy: solana_program::pubkey::Pubkey) -> &mut Self {
        self.dephy = Some(dephy);
        self
    }
    /// The authority of the DePHY account
    #[inline(always)]
    pub fn authority(&mut self, authority: solana_program::pubkey::Pubkey) -> &mut Self {
        self.authority = Some(authority);
        self
    }
    #[inline(always)]
    pub fn bump(&mut self, bump: u8) -> &mut Self {
        self.bump = Some(bump);
        self
    }
    /// Add an aditional account to the instruction.
    #[inline(always)]
    pub fn add_remaining_account(
        &mut self,
        account: solana_program::instruction::AccountMeta,
    ) -> &mut Self {
        self.__remaining_accounts.push(account);
        self
    }
    /// Add additional accounts to the instruction.
    #[inline(always)]
    pub fn add_remaining_accounts(
        &mut self,
        accounts: &[solana_program::instruction::AccountMeta],
    ) -> &mut Self {
        self.__remaining_accounts.extend_from_slice(accounts);
        self
    }
    #[allow(clippy::clone_on_copy)]
    pub fn instruction(&self) -> solana_program::instruction::Instruction {
        let accounts = CreateDephy {
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
            payer: self.payer.expect("payer is not set"),
            dephy: self.dephy.expect("dephy is not set"),
            authority: self.authority.expect("authority is not set"),
        };
        let args = CreateDephyInstructionArgs {
            bump: self.bump.clone().expect("bump is not set"),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `create_dephy` CPI accounts.
pub struct CreateDephyCpiAccounts<'a, 'b> {
    /// The system program
    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
    /// The account paying for the storage fees
    pub payer: &'b solana_program::account_info::AccountInfo<'a>,
    /// The address of the DePHY account
    pub dephy: &'b solana_program::account_info::AccountInfo<'a>,
    /// The authority of the DePHY account
    pub authority: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `create_dephy` CPI instruction.
pub struct CreateDephyCpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,
    /// The system program
    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
    /// The account paying for the storage fees
    pub payer: &'b solana_program::account_info::AccountInfo<'a>,
    /// The address of the DePHY account
    pub dephy: &'b solana_program::account_info::AccountInfo<'a>,
    /// The authority of the DePHY account
    pub authority: &'b solana_program::account_info::AccountInfo<'a>,
    /// The arguments for the instruction.
    pub __args: CreateDephyInstructionArgs,
}

impl<'a, 'b> CreateDephyCpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: CreateDephyCpiAccounts<'a, 'b>,
        args: CreateDephyInstructionArgs,
    ) -> Self {
        Self {
            __program: program,
            system_program: accounts.system_program,
            payer: accounts.payer,
            dephy: accounts.dephy,
            authority: accounts.authority,
            __args: args,
        }
    }
    #[inline(always)]
    pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed_with_remaining_accounts(&[], &[])
    }
    #[inline(always)]
    pub fn invoke_with_remaining_accounts(
        &self,
        remaining_accounts: &[(
            &'b solana_program::account_info::AccountInfo<'a>,
            bool,
            bool,
        )],
    ) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed_with_remaining_accounts(&[], remaining_accounts)
    }
    #[inline(always)]
    pub fn invoke_signed(
        &self,
        signers_seeds: &[&[&[u8]]],
    ) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed_with_remaining_accounts(signers_seeds, &[])
    }
    #[allow(clippy::clone_on_copy)]
    #[allow(clippy::vec_init_then_push)]
    pub fn invoke_signed_with_remaining_accounts(
        &self,
        signers_seeds: &[&[&[u8]]],
        remaining_accounts: &[(
            &'b solana_program::account_info::AccountInfo<'a>,
            bool,
            bool,
        )],
    ) -> solana_program::entrypoint::ProgramResult {
        let mut accounts = Vec::with_capacity(4 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.system_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.payer.key,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.dephy.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.authority.key,
            true,
        ));
        remaining_accounts.iter().for_each(|remaining_account| {
            accounts.push(solana_program::instruction::AccountMeta {
                pubkey: *remaining_account.0.key,
                is_signer: remaining_account.1,
                is_writable: remaining_account.2,
            })
        });
        let mut data = borsh::to_vec(&CreateDephyInstructionData::new()).unwrap();
        let mut args = borsh::to_vec(&self.__args).unwrap();
        data.append(&mut args);

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::DEPHY_ID_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(4 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.system_program.clone());
        account_infos.push(self.payer.clone());
        account_infos.push(self.dephy.clone());
        account_infos.push(self.authority.clone());
        remaining_accounts
            .iter()
            .for_each(|remaining_account| account_infos.push(remaining_account.0.clone()));

        if signers_seeds.is_empty() {
            solana_program::program::invoke(&instruction, &account_infos)
        } else {
            solana_program::program::invoke_signed(&instruction, &account_infos, signers_seeds)
        }
    }
}

/// Instruction builder for `CreateDephy` via CPI.
///
/// ### Accounts:
///
///   0. `[]` system_program
///   1. `[writable, signer]` payer
///   2. `[writable]` dephy
///   3. `[signer]` authority
#[derive(Clone, Debug)]
pub struct CreateDephyCpiBuilder<'a, 'b> {
    instruction: Box<CreateDephyCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> CreateDephyCpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(CreateDephyCpiBuilderInstruction {
            __program: program,
            system_program: None,
            payer: None,
            dephy: None,
            authority: None,
            bump: None,
            __remaining_accounts: Vec::new(),
        });
        Self { instruction }
    }
    /// The system program
    #[inline(always)]
    pub fn system_program(
        &mut self,
        system_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.system_program = Some(system_program);
        self
    }
    /// The account paying for the storage fees
    #[inline(always)]
    pub fn payer(&mut self, payer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.payer = Some(payer);
        self
    }
    /// The address of the DePHY account
    #[inline(always)]
    pub fn dephy(&mut self, dephy: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.dephy = Some(dephy);
        self
    }
    /// The authority of the DePHY account
    #[inline(always)]
    pub fn authority(
        &mut self,
        authority: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.authority = Some(authority);
        self
    }
    #[inline(always)]
    pub fn bump(&mut self, bump: u8) -> &mut Self {
        self.instruction.bump = Some(bump);
        self
    }
    /// Add an additional account to the instruction.
    #[inline(always)]
    pub fn add_remaining_account(
        &mut self,
        account: &'b solana_program::account_info::AccountInfo<'a>,
        is_writable: bool,
        is_signer: bool,
    ) -> &mut Self {
        self.instruction
            .__remaining_accounts
            .push((account, is_writable, is_signer));
        self
    }
    /// Add additional accounts to the instruction.
    ///
    /// Each account is represented by a tuple of the `AccountInfo`, a `bool` indicating whether the account is writable or not,
    /// and a `bool` indicating whether the account is a signer or not.
    #[inline(always)]
    pub fn add_remaining_accounts(
        &mut self,
        accounts: &[(
            &'b solana_program::account_info::AccountInfo<'a>,
            bool,
            bool,
        )],
    ) -> &mut Self {
        self.instruction
            .__remaining_accounts
            .extend_from_slice(accounts);
        self
    }
    #[inline(always)]
    pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed(&[])
    }
    #[allow(clippy::clone_on_copy)]
    #[allow(clippy::vec_init_then_push)]
    pub fn invoke_signed(
        &self,
        signers_seeds: &[&[&[u8]]],
    ) -> solana_program::entrypoint::ProgramResult {
        let args = CreateDephyInstructionArgs {
            bump: self.instruction.bump.clone().expect("bump is not set"),
        };
        let instruction = CreateDephyCpi {
            __program: self.instruction.__program,

            system_program: self
                .instruction
                .system_program
                .expect("system_program is not set"),

            payer: self.instruction.payer.expect("payer is not set"),

            dephy: self.instruction.dephy.expect("dephy is not set"),

            authority: self.instruction.authority.expect("authority is not set"),
            __args: args,
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

#[derive(Clone, Debug)]
struct CreateDephyCpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    payer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    dephy: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    bump: Option<u8>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
