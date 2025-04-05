export type Quartz = {
  "version": "0.9.6",
  "name": "quartz",
  "instructions": [
    {
      "name": "reclaimBridgeRent",
      "accounts": [
        {
          "name": "rentReclaimer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bridgeRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageTransmitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSentEventData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cctpMessageTransmitter",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "attestation",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "initUser",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "initRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "spendLimitPerTransaction",
          "type": "u64"
        },
        {
          "name": "spendLimitPerTimeframe",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        },
        {
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeUser",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "initRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "upgradeVault",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "initRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "spendLimitPerTransaction",
          "type": "u64"
        },
        {
          "name": "spendLimitPerTimeframe",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        },
        {
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "fulfilDeposit",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initiateWithdraw",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "withdrawOrder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "timeLockRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "fulfilWithdraw",
      "accounts": [
        {
          "name": "withdrawOrder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "timeLockRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "startSpend",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spendCaller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "spendFeeDestination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "usdcMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountUsdcBaseUnits",
          "type": "u64"
        },
        {
          "name": "spendFee",
          "type": "bool"
        }
      ]
    },
    {
      "name": "completeSpend",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spendCaller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "usdcMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "senderAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "messageTransmitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMessenger",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "remoteTokenMessenger",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMinter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "localToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSentEventData",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "messageTransmitterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMessengerMinterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "adjustSpendLimits",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "spendLimitPerTransaction",
          "type": "u64"
        },
        {
          "name": "spendLimitPerTimeframe",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        },
        {
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initiateSpendLimits",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "spendLimitsOrder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "timeLockRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "spendLimitPerTransaction",
          "type": "u64"
        },
        {
          "name": "spendLimitPerTimeframe",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        },
        {
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fulfilSpendLimits",
      "accounts": [
        {
          "name": "spendLimitsOrder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "timeLockRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "startCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerDepositSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callerWithdrawSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintDeposit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintWithdraw",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramDeposit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramWithdraw",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rentFloat",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        }
      ],
      "args": []
    },
    {
      "name": "depositCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositMarketIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "withdrawCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositPriceUpdate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "withdrawPriceUpdate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rentFloat",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        }
      ],
      "args": [
        {
          "name": "withdrawMarketIndex",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "spendLimitPerTransaction",
            "type": "u64"
          },
          {
            "name": "spendLimitPerTimeframe",
            "type": "u64"
          },
          {
            "name": "remainingSpendLimitPerTimeframe",
            "type": "u64"
          },
          {
            "name": "nextTimeframeResetTimestamp",
            "type": "u64"
          },
          {
            "name": "timeframeInSeconds",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "collateralRepayLedger",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deposit",
            "type": "u64"
          },
          {
            "name": "withdraw",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timeLock",
            "type": {
              "defined": "TimeLock"
            }
          },
          {
            "name": "amountBaseUnits",
            "type": "u64"
          },
          {
            "name": "driftMarketIndex",
            "type": "u16"
          },
          {
            "name": "reduceOnly",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "spendLimitsOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timeLock",
            "type": {
              "defined": "TimeLock"
            }
          },
          {
            "name": "spendLimitPerTransaction",
            "type": "u64"
          },
          {
            "name": "spendLimitPerTimeframe",
            "type": "u64"
          },
          {
            "name": "timeframeInSeconds",
            "type": "u64"
          },
          {
            "name": "nextTimeframeResetTimestamp",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TimeLock",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "isOwnerPayer",
            "type": "bool"
          },
          {
            "name": "releaseSlot",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "VaultAlreadyInitialized",
      "msg": "Vault already initialized"
    },
    {
      "code": 6001,
      "name": "IllegalCollateralRepayInstructions",
      "msg": "Illegal collateral repay instructions"
    },
    {
      "code": 6002,
      "name": "InvalidMint",
      "msg": "Invalid mint provided"
    },
    {
      "code": 6003,
      "name": "MaxSlippageExceeded",
      "msg": "Price slippage is above maximum"
    },
    {
      "code": 6004,
      "name": "InvalidPlatformFee",
      "msg": "Swap platform fee must be zero"
    },
    {
      "code": 6005,
      "name": "InvalidUserAccounts",
      "msg": "User accounts accross instructions must match"
    },
    {
      "code": 6006,
      "name": "InvalidSourceTokenAccount",
      "msg": "Swap source token account does not match withdraw"
    },
    {
      "code": 6007,
      "name": "InvalidDestinationTokenAccount",
      "msg": "Swap destination token account does not match deposit"
    },
    {
      "code": 6008,
      "name": "InvalidStartBalance",
      "msg": "Declared start balance is not accurate"
    },
    {
      "code": 6009,
      "name": "NegativeOraclePrice",
      "msg": "Price received from oracle should be a positive number"
    },
    {
      "code": 6010,
      "name": "InvalidMarketIndex",
      "msg": "Invalid market index"
    },
    {
      "code": 6011,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6012,
      "name": "InvalidPriceExponent",
      "msg": "Price exponents received from oracle should be the same"
    },
    {
      "code": 6013,
      "name": "UnableToLoadAccountLoader",
      "msg": "Unable to load account loader"
    },
    {
      "code": 6014,
      "name": "DeserializationError",
      "msg": "Could not deserialize introspection instruction data"
    },
    {
      "code": 6015,
      "name": "AutoRepayThresholdNotReached",
      "msg": "Total collateral cannot be less than margin requirement for auto repay"
    },
    {
      "code": 6016,
      "name": "AutoRepayTooMuchSold",
      "msg": "Too much collateral sold in auto repay"
    },
    {
      "code": 6017,
      "name": "AutoRepayNotEnoughSold",
      "msg": "Not enough collateral sold in auto repay"
    },
    {
      "code": 6018,
      "name": "IdenticalCollateralRepayMarkets",
      "msg": "Collateral repay deposit and withdraw markets must be different"
    },
    {
      "code": 6019,
      "name": "InvalidStartingVaultBalance",
      "msg": "Invalid starting vault balance"
    },
    {
      "code": 6020,
      "name": "FreshTokenLedgerRequired",
      "msg": "Provided token ledger is not empty"
    },
    {
      "code": 6021,
      "name": "InvalidEvmAddress",
      "msg": "Provided EVM address does not match expected format"
    },
    {
      "code": 6022,
      "name": "InvalidVaultOwner",
      "msg": "Invalid vault owner"
    },
    {
      "code": 6023,
      "name": "InvalidVaultAddress",
      "msg": "Invalid vault address"
    },
    {
      "code": 6024,
      "name": "LookupTableAlreadyInitialized",
      "msg": "Lookup table already initialized"
    },
    {
      "code": 6025,
      "name": "MissingTokenMint",
      "msg": "Missing token mint"
    },
    {
      "code": 6026,
      "name": "InvalidTokenProgramId",
      "msg": "Invalid token program id"
    },
    {
      "code": 6027,
      "name": "InvalidLookupTable",
      "msg": "Invalid lookup table"
    },
    {
      "code": 6028,
      "name": "InvalidLookupTableContent",
      "msg": "Invalid lookup table content"
    },
    {
      "code": 6029,
      "name": "InvalidLookupTableAuthority",
      "msg": "Invalid lookup table authority"
    },
    {
      "code": 6030,
      "name": "InsufficientTimeframeSpendLimit",
      "msg": "Insufficient spend limit remaining for the timeframe"
    },
    {
      "code": 6031,
      "name": "InsufficientTransactionSpendLimit",
      "msg": "Transaction is larger than the transaction spend limit"
    },
    {
      "code": 6032,
      "name": "IllegalSpendInstructions",
      "msg": "start_spend instruction must be followed by complete_spend instruction"
    },
    {
      "code": 6033,
      "name": "InvalidTimestamp",
      "msg": "Current timestamp cannot be negative"
    },
    {
      "code": 6034,
      "name": "InvalidTimeLockRentPayer",
      "msg": "Time lock rent payer must either be the owner or the time_lock_rent_payer PDA"
    },
    {
      "code": 6035,
      "name": "TimeLockNotReleased",
      "msg": "Release slot has not passed for time lock"
    },
    {
      "code": 6036,
      "name": "InvalidTimeLockOwner",
      "msg": "Time lock owner does not match"
    },
    {
      "code": 6037,
      "name": "AccountAlreadyInitialized",
      "msg": "An initialize instruction was sent to an account that has already been initialized"
    },
    {
      "code": 6038,
      "name": "InvalidOwnerSplWSOL",
      "msg": "owner_spl is required if spl_mint is not wSOL"
    }
  ]
};

export const IDL: Quartz = {
  "version": "0.9.6",
  "name": "quartz",
  "instructions": [
    {
      "name": "reclaimBridgeRent",
      "accounts": [
        {
          "name": "rentReclaimer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bridgeRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageTransmitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSentEventData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cctpMessageTransmitter",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "attestation",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "initUser",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "initRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "spendLimitPerTransaction",
          "type": "u64"
        },
        {
          "name": "spendLimitPerTimeframe",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        },
        {
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeUser",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "initRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "upgradeVault",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "initRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "spendLimitPerTransaction",
          "type": "u64"
        },
        {
          "name": "spendLimitPerTimeframe",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        },
        {
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "fulfilDeposit",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initiateWithdraw",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "withdrawOrder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "timeLockRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "fulfilWithdraw",
      "accounts": [
        {
          "name": "withdrawOrder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "timeLockRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "startSpend",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spendCaller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "spendFeeDestination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "usdcMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountUsdcBaseUnits",
          "type": "u64"
        },
        {
          "name": "spendFee",
          "type": "bool"
        }
      ]
    },
    {
      "name": "completeSpend",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spendCaller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "usdcMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "senderAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "messageTransmitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMessenger",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "remoteTokenMessenger",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMinter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "localToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSentEventData",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "messageTransmitterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMessengerMinterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "adjustSpendLimits",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "spendLimitPerTransaction",
          "type": "u64"
        },
        {
          "name": "spendLimitPerTimeframe",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        },
        {
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initiateSpendLimits",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "spendLimitsOrder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "timeLockRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "spendLimitPerTransaction",
          "type": "u64"
        },
        {
          "name": "spendLimitPerTimeframe",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        },
        {
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fulfilSpendLimits",
      "accounts": [
        {
          "name": "spendLimitsOrder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "timeLockRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "startCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerDepositSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callerWithdrawSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintDeposit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintWithdraw",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramDeposit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramWithdraw",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rentFloat",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        }
      ],
      "args": []
    },
    {
      "name": "depositCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositMarketIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "withdrawCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositPriceUpdate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "withdrawPriceUpdate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rentFloat",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        }
      ],
      "args": [
        {
          "name": "withdrawMarketIndex",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "spendLimitPerTransaction",
            "type": "u64"
          },
          {
            "name": "spendLimitPerTimeframe",
            "type": "u64"
          },
          {
            "name": "remainingSpendLimitPerTimeframe",
            "type": "u64"
          },
          {
            "name": "nextTimeframeResetTimestamp",
            "type": "u64"
          },
          {
            "name": "timeframeInSeconds",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "collateralRepayLedger",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deposit",
            "type": "u64"
          },
          {
            "name": "withdraw",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timeLock",
            "type": {
              "defined": "TimeLock"
            }
          },
          {
            "name": "amountBaseUnits",
            "type": "u64"
          },
          {
            "name": "driftMarketIndex",
            "type": "u16"
          },
          {
            "name": "reduceOnly",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "spendLimitsOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timeLock",
            "type": {
              "defined": "TimeLock"
            }
          },
          {
            "name": "spendLimitPerTransaction",
            "type": "u64"
          },
          {
            "name": "spendLimitPerTimeframe",
            "type": "u64"
          },
          {
            "name": "timeframeInSeconds",
            "type": "u64"
          },
          {
            "name": "nextTimeframeResetTimestamp",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TimeLock",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "isOwnerPayer",
            "type": "bool"
          },
          {
            "name": "releaseSlot",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "VaultAlreadyInitialized",
      "msg": "Vault already initialized"
    },
    {
      "code": 6001,
      "name": "IllegalCollateralRepayInstructions",
      "msg": "Illegal collateral repay instructions"
    },
    {
      "code": 6002,
      "name": "InvalidMint",
      "msg": "Invalid mint provided"
    },
    {
      "code": 6003,
      "name": "MaxSlippageExceeded",
      "msg": "Price slippage is above maximum"
    },
    {
      "code": 6004,
      "name": "InvalidPlatformFee",
      "msg": "Swap platform fee must be zero"
    },
    {
      "code": 6005,
      "name": "InvalidUserAccounts",
      "msg": "User accounts accross instructions must match"
    },
    {
      "code": 6006,
      "name": "InvalidSourceTokenAccount",
      "msg": "Swap source token account does not match withdraw"
    },
    {
      "code": 6007,
      "name": "InvalidDestinationTokenAccount",
      "msg": "Swap destination token account does not match deposit"
    },
    {
      "code": 6008,
      "name": "InvalidStartBalance",
      "msg": "Declared start balance is not accurate"
    },
    {
      "code": 6009,
      "name": "NegativeOraclePrice",
      "msg": "Price received from oracle should be a positive number"
    },
    {
      "code": 6010,
      "name": "InvalidMarketIndex",
      "msg": "Invalid market index"
    },
    {
      "code": 6011,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6012,
      "name": "InvalidPriceExponent",
      "msg": "Price exponents received from oracle should be the same"
    },
    {
      "code": 6013,
      "name": "UnableToLoadAccountLoader",
      "msg": "Unable to load account loader"
    },
    {
      "code": 6014,
      "name": "DeserializationError",
      "msg": "Could not deserialize introspection instruction data"
    },
    {
      "code": 6015,
      "name": "AutoRepayThresholdNotReached",
      "msg": "Total collateral cannot be less than margin requirement for auto repay"
    },
    {
      "code": 6016,
      "name": "AutoRepayTooMuchSold",
      "msg": "Too much collateral sold in auto repay"
    },
    {
      "code": 6017,
      "name": "AutoRepayNotEnoughSold",
      "msg": "Not enough collateral sold in auto repay"
    },
    {
      "code": 6018,
      "name": "IdenticalCollateralRepayMarkets",
      "msg": "Collateral repay deposit and withdraw markets must be different"
    },
    {
      "code": 6019,
      "name": "InvalidStartingVaultBalance",
      "msg": "Invalid starting vault balance"
    },
    {
      "code": 6020,
      "name": "FreshTokenLedgerRequired",
      "msg": "Provided token ledger is not empty"
    },
    {
      "code": 6021,
      "name": "InvalidEvmAddress",
      "msg": "Provided EVM address does not match expected format"
    },
    {
      "code": 6022,
      "name": "InvalidVaultOwner",
      "msg": "Invalid vault owner"
    },
    {
      "code": 6023,
      "name": "InvalidVaultAddress",
      "msg": "Invalid vault address"
    },
    {
      "code": 6024,
      "name": "LookupTableAlreadyInitialized",
      "msg": "Lookup table already initialized"
    },
    {
      "code": 6025,
      "name": "MissingTokenMint",
      "msg": "Missing token mint"
    },
    {
      "code": 6026,
      "name": "InvalidTokenProgramId",
      "msg": "Invalid token program id"
    },
    {
      "code": 6027,
      "name": "InvalidLookupTable",
      "msg": "Invalid lookup table"
    },
    {
      "code": 6028,
      "name": "InvalidLookupTableContent",
      "msg": "Invalid lookup table content"
    },
    {
      "code": 6029,
      "name": "InvalidLookupTableAuthority",
      "msg": "Invalid lookup table authority"
    },
    {
      "code": 6030,
      "name": "InsufficientTimeframeSpendLimit",
      "msg": "Insufficient spend limit remaining for the timeframe"
    },
    {
      "code": 6031,
      "name": "InsufficientTransactionSpendLimit",
      "msg": "Transaction is larger than the transaction spend limit"
    },
    {
      "code": 6032,
      "name": "IllegalSpendInstructions",
      "msg": "start_spend instruction must be followed by complete_spend instruction"
    },
    {
      "code": 6033,
      "name": "InvalidTimestamp",
      "msg": "Current timestamp cannot be negative"
    },
    {
      "code": 6034,
      "name": "InvalidTimeLockRentPayer",
      "msg": "Time lock rent payer must either be the owner or the time_lock_rent_payer PDA"
    },
    {
      "code": 6035,
      "name": "TimeLockNotReleased",
      "msg": "Release slot has not passed for time lock"
    },
    {
      "code": 6036,
      "name": "InvalidTimeLockOwner",
      "msg": "Time lock owner does not match"
    },
    {
      "code": 6037,
      "name": "AccountAlreadyInitialized",
      "msg": "An initialize instruction was sent to an account that has already been initialized"
    },
    {
      "code": 6038,
      "name": "InvalidOwnerSplWSOL",
      "msg": "owner_spl is required if spl_mint is not wSOL"
    }
  ]
};
