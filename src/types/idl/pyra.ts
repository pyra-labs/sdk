export type Pyra = {
  "version": "0.14.8",
  "name": "pyra",
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
      "name": "updateDriftName",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
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
        },
        {
          "name": "depositAddress",
          "isMut": true,
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
        },
        {
          "name": "depositAddress",
          "isMut": true,
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
      "name": "fulfilDeposit",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAddressSpl",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Option because SOL in the deposit_address will be regular lamports, not wSOL"
          ]
        },
        {
          "name": "mule",
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
          "name": "mint",
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
          "name": "driftMarketIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "rescueDeposit",
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
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAddressSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
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
        },
        {
          "name": "destination",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
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
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationSpl",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "depositAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAddressSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelWithdraw",
      "accounts": [
        {
          "name": "withdrawOrder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
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
          "name": "depositAddress",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositAddressUsdc",
          "isMut": true,
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
          "name": "spendFeeUsdcBaseUnits",
          "type": "u64"
        }
      ]
    },
    {
      "name": "completeSpend",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
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
          "isMut": false,
          "isSigner": true
        },
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
      "name": "increaseSpendLimits",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
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
          "isMut": false,
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
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
      "name": "collateralRepayLedger",
      "docs": [
        "Ledger for tracking the balance changes of each token during the swap instruction of collateral repay"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deposit",
            "docs": [
              "The amount of collateral deposited"
            ],
            "type": "u64"
          },
          {
            "name": "withdraw",
            "docs": [
              "The amount of collateral withdrawn"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "spendLimitsOrder",
      "docs": [
        "Time locked order for updating the spend limits of a vault"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timeLock",
            "docs": [
              "Shared time lock data"
            ],
            "type": {
              "defined": "TimeLock"
            }
          },
          {
            "name": "spendLimitPerTransaction",
            "docs": [
              "The maximum amount of USDC that can be spent in a single transaction"
            ],
            "type": "u64"
          },
          {
            "name": "spendLimitPerTimeframe",
            "docs": [
              "The maximum amount of USDC that can be spent in a single timeframe"
            ],
            "type": "u64"
          },
          {
            "name": "timeframeInSeconds",
            "docs": [
              "The duration of a timeframe in seconds"
            ],
            "type": "u64"
          },
          {
            "name": "nextTimeframeResetTimestamp",
            "docs": [
              "The timestamp at which the next timeframe will reset"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawOrder",
      "docs": [
        "Time locked order for withdrawing funds from a vault"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timeLock",
            "docs": [
              "Shared time lock data"
            ],
            "type": {
              "defined": "TimeLock"
            }
          },
          {
            "name": "amountBaseUnits",
            "docs": [
              "The amount of base units to withdraw"
            ],
            "type": "u64"
          },
          {
            "name": "driftMarketIndex",
            "docs": [
              "The drift market index to withdraw from"
            ],
            "type": "u16"
          },
          {
            "name": "reduceOnly",
            "docs": [
              "Whether the withdraw is reduce only"
            ],
            "type": "bool"
          },
          {
            "name": "destination",
            "docs": [
              "The destination of the withdraw"
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "vault",
      "docs": [
        "Main user account for the Pyra protocol. Is the authority for DeFi integration accounts, and handles spend limits for the card."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "TODO: Change discriminator to 1 byte once able to upgrade to anchor 0.31",
              "Note: If the owner becomes changeable in the future, need to add has_one contstraints to all ixs"
            ],
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "spendLimitPerTransaction",
            "docs": [
              "The maximum amount of USDC that can be spent in a single transaction"
            ],
            "type": "u64"
          },
          {
            "name": "spendLimitPerTimeframe",
            "docs": [
              "The maximum amount of USDC that can be spent in a single timeframe"
            ],
            "type": "u64"
          },
          {
            "name": "remainingSpendLimitPerTimeframe",
            "docs": [
              "The remaining amount of USDC that can be spent in the current timeframe"
            ],
            "type": "u64"
          },
          {
            "name": "nextTimeframeResetTimestamp",
            "docs": [
              "The next timestamp the remaining_spend_limit_per_timeframe will be reset at"
            ],
            "type": "u64"
          },
          {
            "name": "timeframeInSeconds",
            "docs": [
              "How much to extend the next_timeframe_reset_timestamp by when it's reached"
            ],
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TimeLock",
      "docs": [
        "Time lock used to prevent an order being executed before the release_slot"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "The owner of the time lock"
            ],
            "type": "publicKey"
          },
          {
            "name": "isOwnerPayer",
            "docs": [
              "Whether the owner is the payer of the rent"
            ],
            "type": "bool"
          },
          {
            "name": "releaseSlot",
            "docs": [
              "The slot at which the time lock will be released"
            ],
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "IllegalCollateralRepayInstructions",
      "msg": "Illegal collateral repay instructions"
    },
    {
      "code": 6001,
      "name": "IllegalCollateralRepayCPI",
      "msg": "Collateral repay cannot be called as a CPI"
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
      "name": "InvalidSlippageBPS",
      "msg": "Max slippage config is above maximum BPS"
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
      "name": "NegativeOraclePrice",
      "msg": "Price received from oracle should be a positive number"
    },
    {
      "code": 6008,
      "name": "InvalidMarketIndex",
      "msg": "Invalid market index"
    },
    {
      "code": 6009,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6010,
      "name": "InvalidPriceExponent",
      "msg": "Price exponents received from oracle should be the same"
    },
    {
      "code": 6011,
      "name": "UnableToLoadAccountLoader",
      "msg": "Unable to load account loader"
    },
    {
      "code": 6012,
      "name": "AutoRepayThresholdNotReached",
      "msg": "Total collateral cannot be less than margin requirement for auto repay"
    },
    {
      "code": 6013,
      "name": "AutoRepayTooMuchSold",
      "msg": "Too much collateral sold in auto repay"
    },
    {
      "code": 6014,
      "name": "AutoRepayNotEnoughSold",
      "msg": "Not enough collateral sold in auto repay"
    },
    {
      "code": 6015,
      "name": "IdenticalCollateralRepayMarkets",
      "msg": "Collateral repay deposit and withdraw markets must be different"
    },
    {
      "code": 6016,
      "name": "InvalidStartingVaultBalance",
      "msg": "Invalid starting vault balance"
    },
    {
      "code": 6017,
      "name": "InvalidEvmAddress",
      "msg": "Provided EVM address does not match expected format"
    },
    {
      "code": 6018,
      "name": "InvalidVaultOwner",
      "msg": "Invalid vault owner"
    },
    {
      "code": 6019,
      "name": "InsufficientTimeframeSpendLimit",
      "msg": "Insufficient spend limit remaining for the timeframe"
    },
    {
      "code": 6020,
      "name": "InsufficientTransactionSpendLimit",
      "msg": "Transaction is larger than the transaction spend limit"
    },
    {
      "code": 6021,
      "name": "IllegalSpendInstructions",
      "msg": "start_spend instruction must be followed by complete_spend instruction"
    },
    {
      "code": 6022,
      "name": "InvalidTimestamp",
      "msg": "Current timestamp cannot be negative"
    },
    {
      "code": 6023,
      "name": "InvalidTimeLockRentPayer",
      "msg": "Time lock rent payer must either be the owner or the time_lock_rent_payer PDA"
    },
    {
      "code": 6024,
      "name": "TimeLockNotReleased",
      "msg": "Release slot has not passed for time lock"
    },
    {
      "code": 6025,
      "name": "InvalidTimeLockOwner",
      "msg": "Time lock owner does not match"
    },
    {
      "code": 6026,
      "name": "MissingDestinationSpl",
      "msg": "destination_spl is required if spl_mint is not wSOL"
    },
    {
      "code": 6027,
      "name": "MissingDepositAddressSpl",
      "msg": "deposit_address_spl is required if spl_mint is not wSOL"
    },
    {
      "code": 6028,
      "name": "InvalidWithdrawDestination",
      "msg": "Withdraw destination does not match order account"
    },
    {
      "code": 6029,
      "name": "InvalidSpendFeeDestination",
      "msg": "Invalid spend fee destination"
    },
    {
      "code": 6030,
      "name": "InvalidSpendCaller",
      "msg": "Invalid spend caller"
    },
    {
      "code": 6031,
      "name": "AccountAlreadyInitialized",
      "msg": "Account is already initialized"
    },
    {
      "code": 6032,
      "name": "InvalidAdminKeypair",
      "msg": "Invalid admin keypair"
    },
    {
      "code": 6033,
      "name": "FailedToDeserializeMarketIndex",
      "msg": "Failed to deserialize market index"
    },
    {
      "code": 6034,
      "name": "FailedToDeserializeVaultBytes",
      "msg": "Failed to deserialize vault bytes"
    },
    {
      "code": 6035,
      "name": "InvalidVaultAccount",
      "msg": "Invalid vault account"
    },
    {
      "code": 6036,
      "name": "IllegalVaultCPIModification",
      "msg": "Vault data was illegally modified during a CPI"
    },
    {
      "code": 6037,
      "name": "InvalidDepositAddressOwner",
      "msg": "Deposit address must be owned by the system program"
    },
    {
      "code": 6038,
      "name": "InvalidSpendFeeBPS",
      "msg": "Spend fee BPS is above maximum"
    },
    {
      "code": 6039,
      "name": "InvalidDepositAddressUSDC",
      "msg": "Invalid USDC ATA for deposit address"
    },
    {
      "code": 6040,
      "name": "IllegalSpendLimitDecrease",
      "msg": "Spend limit cannot be decreased in the increase spend limits instruction"
    },
    {
      "code": 6041,
      "name": "IllegalRescueSupportedToken",
      "msg": "Cannot rescue a supported token"
    },
    {
      "code": 6042,
      "name": "TransferZero",
      "msg": "Cannot transfer zero tokens"
    },
    {
      "code": 6043,
      "name": "InvalidTimeframe",
      "msg": "Invalid timeframe"
    },
    {
      "code": 6044,
      "name": "WithdrawAmountTooHigh",
      "msg": "Withdraw amount is above requested"
    },
    {
      "code": 6045,
      "name": "WithdrawAmountTooLow",
      "msg": "Withdraw amount is too far below requested"
    }
  ]
};

export const IDL: Pyra = {
  "version": "0.14.8",
  "name": "pyra",
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
      "name": "updateDriftName",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
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
        },
        {
          "name": "depositAddress",
          "isMut": true,
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
        },
        {
          "name": "depositAddress",
          "isMut": true,
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
      "name": "fulfilDeposit",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAddressSpl",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Option because SOL in the deposit_address will be regular lamports, not wSOL"
          ]
        },
        {
          "name": "mule",
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
          "name": "mint",
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
          "name": "driftMarketIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "rescueDeposit",
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
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAddressSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
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
        },
        {
          "name": "destination",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
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
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationSpl",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "depositAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAddressSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelWithdraw",
      "accounts": [
        {
          "name": "withdrawOrder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
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
          "name": "depositAddress",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositAddressUsdc",
          "isMut": true,
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
          "name": "spendFeeUsdcBaseUnits",
          "type": "u64"
        }
      ]
    },
    {
      "name": "completeSpend",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
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
          "isMut": false,
          "isSigner": true
        },
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
      "name": "increaseSpendLimits",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
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
          "isMut": false,
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
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
      "name": "collateralRepayLedger",
      "docs": [
        "Ledger for tracking the balance changes of each token during the swap instruction of collateral repay"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deposit",
            "docs": [
              "The amount of collateral deposited"
            ],
            "type": "u64"
          },
          {
            "name": "withdraw",
            "docs": [
              "The amount of collateral withdrawn"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "spendLimitsOrder",
      "docs": [
        "Time locked order for updating the spend limits of a vault"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timeLock",
            "docs": [
              "Shared time lock data"
            ],
            "type": {
              "defined": "TimeLock"
            }
          },
          {
            "name": "spendLimitPerTransaction",
            "docs": [
              "The maximum amount of USDC that can be spent in a single transaction"
            ],
            "type": "u64"
          },
          {
            "name": "spendLimitPerTimeframe",
            "docs": [
              "The maximum amount of USDC that can be spent in a single timeframe"
            ],
            "type": "u64"
          },
          {
            "name": "timeframeInSeconds",
            "docs": [
              "The duration of a timeframe in seconds"
            ],
            "type": "u64"
          },
          {
            "name": "nextTimeframeResetTimestamp",
            "docs": [
              "The timestamp at which the next timeframe will reset"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawOrder",
      "docs": [
        "Time locked order for withdrawing funds from a vault"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timeLock",
            "docs": [
              "Shared time lock data"
            ],
            "type": {
              "defined": "TimeLock"
            }
          },
          {
            "name": "amountBaseUnits",
            "docs": [
              "The amount of base units to withdraw"
            ],
            "type": "u64"
          },
          {
            "name": "driftMarketIndex",
            "docs": [
              "The drift market index to withdraw from"
            ],
            "type": "u16"
          },
          {
            "name": "reduceOnly",
            "docs": [
              "Whether the withdraw is reduce only"
            ],
            "type": "bool"
          },
          {
            "name": "destination",
            "docs": [
              "The destination of the withdraw"
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "vault",
      "docs": [
        "Main user account for the Pyra protocol. Is the authority for DeFi integration accounts, and handles spend limits for the card."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "TODO: Change discriminator to 1 byte once able to upgrade to anchor 0.31",
              "Note: If the owner becomes changeable in the future, need to add has_one contstraints to all ixs"
            ],
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "spendLimitPerTransaction",
            "docs": [
              "The maximum amount of USDC that can be spent in a single transaction"
            ],
            "type": "u64"
          },
          {
            "name": "spendLimitPerTimeframe",
            "docs": [
              "The maximum amount of USDC that can be spent in a single timeframe"
            ],
            "type": "u64"
          },
          {
            "name": "remainingSpendLimitPerTimeframe",
            "docs": [
              "The remaining amount of USDC that can be spent in the current timeframe"
            ],
            "type": "u64"
          },
          {
            "name": "nextTimeframeResetTimestamp",
            "docs": [
              "The next timestamp the remaining_spend_limit_per_timeframe will be reset at"
            ],
            "type": "u64"
          },
          {
            "name": "timeframeInSeconds",
            "docs": [
              "How much to extend the next_timeframe_reset_timestamp by when it's reached"
            ],
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TimeLock",
      "docs": [
        "Time lock used to prevent an order being executed before the release_slot"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "The owner of the time lock"
            ],
            "type": "publicKey"
          },
          {
            "name": "isOwnerPayer",
            "docs": [
              "Whether the owner is the payer of the rent"
            ],
            "type": "bool"
          },
          {
            "name": "releaseSlot",
            "docs": [
              "The slot at which the time lock will be released"
            ],
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "IllegalCollateralRepayInstructions",
      "msg": "Illegal collateral repay instructions"
    },
    {
      "code": 6001,
      "name": "IllegalCollateralRepayCPI",
      "msg": "Collateral repay cannot be called as a CPI"
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
      "name": "InvalidSlippageBPS",
      "msg": "Max slippage config is above maximum BPS"
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
      "name": "NegativeOraclePrice",
      "msg": "Price received from oracle should be a positive number"
    },
    {
      "code": 6008,
      "name": "InvalidMarketIndex",
      "msg": "Invalid market index"
    },
    {
      "code": 6009,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6010,
      "name": "InvalidPriceExponent",
      "msg": "Price exponents received from oracle should be the same"
    },
    {
      "code": 6011,
      "name": "UnableToLoadAccountLoader",
      "msg": "Unable to load account loader"
    },
    {
      "code": 6012,
      "name": "AutoRepayThresholdNotReached",
      "msg": "Total collateral cannot be less than margin requirement for auto repay"
    },
    {
      "code": 6013,
      "name": "AutoRepayTooMuchSold",
      "msg": "Too much collateral sold in auto repay"
    },
    {
      "code": 6014,
      "name": "AutoRepayNotEnoughSold",
      "msg": "Not enough collateral sold in auto repay"
    },
    {
      "code": 6015,
      "name": "IdenticalCollateralRepayMarkets",
      "msg": "Collateral repay deposit and withdraw markets must be different"
    },
    {
      "code": 6016,
      "name": "InvalidStartingVaultBalance",
      "msg": "Invalid starting vault balance"
    },
    {
      "code": 6017,
      "name": "InvalidEvmAddress",
      "msg": "Provided EVM address does not match expected format"
    },
    {
      "code": 6018,
      "name": "InvalidVaultOwner",
      "msg": "Invalid vault owner"
    },
    {
      "code": 6019,
      "name": "InsufficientTimeframeSpendLimit",
      "msg": "Insufficient spend limit remaining for the timeframe"
    },
    {
      "code": 6020,
      "name": "InsufficientTransactionSpendLimit",
      "msg": "Transaction is larger than the transaction spend limit"
    },
    {
      "code": 6021,
      "name": "IllegalSpendInstructions",
      "msg": "start_spend instruction must be followed by complete_spend instruction"
    },
    {
      "code": 6022,
      "name": "InvalidTimestamp",
      "msg": "Current timestamp cannot be negative"
    },
    {
      "code": 6023,
      "name": "InvalidTimeLockRentPayer",
      "msg": "Time lock rent payer must either be the owner or the time_lock_rent_payer PDA"
    },
    {
      "code": 6024,
      "name": "TimeLockNotReleased",
      "msg": "Release slot has not passed for time lock"
    },
    {
      "code": 6025,
      "name": "InvalidTimeLockOwner",
      "msg": "Time lock owner does not match"
    },
    {
      "code": 6026,
      "name": "MissingDestinationSpl",
      "msg": "destination_spl is required if spl_mint is not wSOL"
    },
    {
      "code": 6027,
      "name": "MissingDepositAddressSpl",
      "msg": "deposit_address_spl is required if spl_mint is not wSOL"
    },
    {
      "code": 6028,
      "name": "InvalidWithdrawDestination",
      "msg": "Withdraw destination does not match order account"
    },
    {
      "code": 6029,
      "name": "InvalidSpendFeeDestination",
      "msg": "Invalid spend fee destination"
    },
    {
      "code": 6030,
      "name": "InvalidSpendCaller",
      "msg": "Invalid spend caller"
    },
    {
      "code": 6031,
      "name": "AccountAlreadyInitialized",
      "msg": "Account is already initialized"
    },
    {
      "code": 6032,
      "name": "InvalidAdminKeypair",
      "msg": "Invalid admin keypair"
    },
    {
      "code": 6033,
      "name": "FailedToDeserializeMarketIndex",
      "msg": "Failed to deserialize market index"
    },
    {
      "code": 6034,
      "name": "FailedToDeserializeVaultBytes",
      "msg": "Failed to deserialize vault bytes"
    },
    {
      "code": 6035,
      "name": "InvalidVaultAccount",
      "msg": "Invalid vault account"
    },
    {
      "code": 6036,
      "name": "IllegalVaultCPIModification",
      "msg": "Vault data was illegally modified during a CPI"
    },
    {
      "code": 6037,
      "name": "InvalidDepositAddressOwner",
      "msg": "Deposit address must be owned by the system program"
    },
    {
      "code": 6038,
      "name": "InvalidSpendFeeBPS",
      "msg": "Spend fee BPS is above maximum"
    },
    {
      "code": 6039,
      "name": "InvalidDepositAddressUSDC",
      "msg": "Invalid USDC ATA for deposit address"
    },
    {
      "code": 6040,
      "name": "IllegalSpendLimitDecrease",
      "msg": "Spend limit cannot be decreased in the increase spend limits instruction"
    },
    {
      "code": 6041,
      "name": "IllegalRescueSupportedToken",
      "msg": "Cannot rescue a supported token"
    },
    {
      "code": 6042,
      "name": "TransferZero",
      "msg": "Cannot transfer zero tokens"
    },
    {
      "code": 6043,
      "name": "InvalidTimeframe",
      "msg": "Invalid timeframe"
    },
    {
      "code": 6044,
      "name": "WithdrawAmountTooHigh",
      "msg": "Withdraw amount is above requested"
    },
    {
      "code": 6045,
      "name": "WithdrawAmountTooLow",
      "msg": "Withdraw amount is too far below requested"
    }
  ]
};
