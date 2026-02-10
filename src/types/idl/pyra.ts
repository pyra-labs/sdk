/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pyra.json`.
 */
export type Pyra = {
  "address": "6JjHXLheGSNvvexgzMthEcgjkcirDrGduc3HAKB2P1v2",
  "metadata": {
    "name": "pyra",
    "version": "1.1.0",
    "spec": "0.1.0",
    "description": "Pyra's Solana smart contract"
  },
  "instructions": [
    {
      "name": "cancelUpdateSpendLimits",
      "discriminator": [
        72,
        248,
        219,
        51,
        170,
        154,
        239,
        158
      ],
      "accounts": [
        {
          "name": "spendLimitsOrder",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "orderPayer",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "cancelWithdrawDrift",
      "discriminator": [
        75,
        154,
        210,
        190,
        105,
        179,
        128,
        253
      ],
      "accounts": [
        {
          "name": "withdrawOrder",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "orderPayer",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "clearLegacyDepositAddress",
      "discriminator": [
        248,
        10,
        109,
        181,
        71,
        75,
        143,
        196
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true
        },
        {
          "name": "ownerSpl",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "depositAddress",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  95,
                  97,
                  100,
                  100,
                  114,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "depositAddressSpl",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "depositAddress"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint",
          "optional": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeDrift",
      "discriminator": [
        74,
        197,
        147,
        222,
        187,
        112,
        21,
        145
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "driftUser",
          "writable": true
        },
        {
          "name": "driftUserStats",
          "writable": true
        },
        {
          "name": "driftState",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeUser",
      "discriminator": [
        86,
        219,
        138,
        140,
        236,
        24,
        118,
        200
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        }
      ],
      "args": []
    },
    {
      "name": "depositDrift",
      "discriminator": [
        4
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "vaultSpl",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "vault"
          ]
        },
        {
          "name": "ownerSpl",
          "docs": [
            "Option because SOL in the owner's wallet will be regular lamports, not wSOL"
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "driftUser",
          "writable": true
        },
        {
          "name": "driftUserStats",
          "writable": true
        },
        {
          "name": "driftState",
          "writable": true
        },
        {
          "name": "driftSpotMarketVault",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
      "name": "depositDriftFromPda",
      "discriminator": [
        18,
        70,
        190,
        154,
        86,
        199,
        132,
        143
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "vaultSpl",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "depositAddress",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  95,
                  97,
                  100,
                  100,
                  114,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "depositAddressSpl",
          "docs": [
            "Option because SOL in the deposit_address will be regular lamports, not wSOL"
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "depositAddress"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "driftUser",
          "writable": true
        },
        {
          "name": "driftUserStats",
          "writable": true
        },
        {
          "name": "driftState",
          "writable": true
        },
        {
          "name": "driftSpotMarketVault",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
      "name": "endSwapDriftV2",
      "discriminator": [
        3
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "This account is required because even in the case where the owner is signing this transaction, it may",
            "not be the one executing the swap instruction(s) between start_swap_drift and execute_swap_drift.",
            "Normally, a specific flash loan caller and its ATAs are used."
          ]
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "vaultSplTo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgramTo"
              },
              {
                "kind": "account",
                "path": "mintTo"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultSplSubstitute",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgramSubstitute"
              },
              {
                "kind": "account",
                "path": "mintSubstitute"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "caller",
          "signer": true
        },
        {
          "name": "callerSplTo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "caller"
              },
              {
                "kind": "account",
                "path": "tokenProgramTo"
              },
              {
                "kind": "account",
                "path": "mintTo"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "callerSplSubstitute",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "caller"
              },
              {
                "kind": "account",
                "path": "tokenProgramSubstitute"
              },
              {
                "kind": "account",
                "path": "mintSubstitute"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mintFrom",
          "docs": [
            "start_swap_drift_v2 validates the mint matches the token program"
          ]
        },
        {
          "name": "mintTo",
          "docs": [
            "start_swap_drift_v2 validates the mint matches the token program"
          ]
        },
        {
          "name": "mintSubstitute",
          "docs": [
            "start_swap_drift_v2 validates the mint matches the token program"
          ]
        },
        {
          "name": "tokenProgramTo"
        },
        {
          "name": "tokenProgramSubstitute"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "ledger",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  95,
                  108,
                  101,
                  100,
                  103,
                  101,
                  114,
                  95,
                  118,
                  50
                ]
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ]
          }
        },
        {
          "name": "driftUser",
          "writable": true
        },
        {
          "name": "driftUserStats",
          "writable": true
        },
        {
          "name": "driftState"
        },
        {
          "name": "driftSpotMarketVaultTo",
          "writable": true
        },
        {
          "name": "driftSpotMarketVaultSubstitute",
          "writable": true
        },
        {
          "name": "driftSigner"
        },
        {
          "name": "priceUpdateFrom"
        },
        {
          "name": "priceUpdateTo"
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "instructionsSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "driftMarketIndexSubstitute",
          "type": "u16"
        },
        {
          "name": "driftMarketIndexFrom",
          "type": "u16"
        },
        {
          "name": "driftMarketIndexTo",
          "type": "u16"
        }
      ]
    },
    {
      "name": "executeSwapDrift",
      "discriminator": [
        1
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "This account is required because even in the case where the owner is signing this transaction, it may",
            "not be the one executing the swap instruction(s) between start_swap_drift and execute_swap_drift.",
            "Normally, a specific flash loan caller and its ATAs are used."
          ]
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "vaultSplFrom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgramFrom"
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultSplTo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgramTo"
              },
              {
                "kind": "account",
                "path": "mintTo"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "caller",
          "signer": true
        },
        {
          "name": "callerSplFrom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "caller"
              },
              {
                "kind": "account",
                "path": "tokenProgramFrom"
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "callerSplTo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "caller"
              },
              {
                "kind": "account",
                "path": "tokenProgramTo"
              },
              {
                "kind": "account",
                "path": "mintTo"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mintFrom",
          "docs": [
            "start_swap_drift validates the mint matches the token program"
          ]
        },
        {
          "name": "mintTo",
          "docs": [
            "start_swap_drift validates the mint matches the token program"
          ]
        },
        {
          "name": "tokenProgramFrom"
        },
        {
          "name": "tokenProgramTo"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "ledger",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  95,
                  108,
                  101,
                  100,
                  103,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ]
          }
        },
        {
          "name": "driftUser",
          "writable": true
        },
        {
          "name": "driftUserStats",
          "writable": true
        },
        {
          "name": "driftState"
        },
        {
          "name": "driftSpotMarketVaultFrom",
          "writable": true
        },
        {
          "name": "driftSpotMarketVaultTo",
          "writable": true
        },
        {
          "name": "driftSigner"
        },
        {
          "name": "priceUpdateFrom"
        },
        {
          "name": "priceUpdateTo"
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "instructionsSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "driftMarketIndexFrom",
          "type": "u16"
        },
        {
          "name": "driftMarketIndexTo",
          "type": "u16"
        }
      ]
    },
    {
      "name": "fulfilUpdateSpendLimits",
      "discriminator": [
        224,
        103,
        67,
        22,
        109,
        97,
        18,
        115
      ],
      "accounts": [
        {
          "name": "spendLimitsOrder",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "orderPayer",
          "writable": true
        },
        {
          "name": "admin"
        }
      ],
      "args": []
    },
    {
      "name": "fulfilWithdrawDrift",
      "discriminator": [
        29,
        74,
        221,
        143,
        220,
        251,
        251,
        171
      ],
      "accounts": [
        {
          "name": "withdrawOrder",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "orderPayer",
          "writable": true
        },
        {
          "name": "admin"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "destinationSpl",
          "docs": [
            "destination_spl is not required if sending lamports instead of SPL tokens"
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "destination"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultSpl",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "driftUser",
          "writable": true
        },
        {
          "name": "driftUserStats",
          "writable": true
        },
        {
          "name": "driftState",
          "writable": true
        },
        {
          "name": "driftSpotMarketVault",
          "writable": true
        },
        {
          "name": "driftSigner"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
      "name": "initDrift",
      "discriminator": [
        66,
        163,
        62,
        134,
        7,
        17,
        7,
        54
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "payer",
          "signer": true
        },
        {
          "name": "driftUser",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "arg",
                "path": "subAccountId"
              }
            ],
            "program": {
              "kind": "account",
              "path": "driftProgram"
            }
          }
        },
        {
          "name": "driftUserStats",
          "writable": true
        },
        {
          "name": "driftState",
          "writable": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "subAccountId",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initUser",
      "discriminator": [
        14,
        51,
        68,
        159,
        237,
        78,
        158,
        102
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initiateUpdateSpendLimits",
      "discriminator": [
        67,
        43,
        56,
        35,
        125,
        99,
        211,
        216
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "spendLimitsOrder",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
          "name": "nextTimeframeResetTimestamp",
          "type": "u64"
        },
        {
          "name": "timeframeInSeconds",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initiateWithdrawDrift",
      "discriminator": [
        65,
        162,
        143,
        155,
        180,
        121,
        157,
        11
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "withdrawOrder",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "destination"
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
      "name": "refundSpend",
      "discriminator": [
        200,
        34,
        117,
        82,
        47,
        93,
        16,
        62
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true
        },
        {
          "name": "depositAddress",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  95,
                  97,
                  100,
                  100,
                  114,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "depositAddressSpl",
          "docs": [
            "Option because SOL in the legacy deposit_address will be regular lamports, not wSOL"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "depositAddress"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "spendHold",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  101,
                  110,
                  100,
                  95,
                  104,
                  111,
                  108,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "spendHoldSpl",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "spendHold"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
      "name": "settleSpend",
      "discriminator": [
        53,
        31,
        134,
        126,
        85,
        246,
        94,
        195
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "spendSettlementAccount",
          "writable": true
        },
        {
          "name": "spendSettlementAccountSpl",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "spendSettlementAccount"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "spendHold",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  101,
                  110,
                  100,
                  95,
                  104,
                  111,
                  108,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "spendHoldSpl",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "spendHold"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
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
      "name": "spendDrift",
      "discriminator": [
        52,
        18,
        184,
        116,
        236,
        49,
        249,
        223
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "vaultSpl",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "spendHold",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  101,
                  110,
                  100,
                  95,
                  104,
                  111,
                  108,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "spendHoldSpl",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "spendHold"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "spendFeeDestination"
        },
        {
          "name": "spendFeeDestinationSpl",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "spendFeeDestination"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "driftUser",
          "writable": true
        },
        {
          "name": "driftUserStats",
          "writable": true
        },
        {
          "name": "driftState",
          "writable": true
        },
        {
          "name": "driftSpotMarketVault",
          "writable": true
        },
        {
          "name": "driftSigner"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "spendAmountBaseUnits",
          "type": "u64"
        },
        {
          "name": "feeAmountBaseUnits",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startSwapDrift",
      "discriminator": [
        0
      ],
      "accounts": [
        {
          "name": "vault"
        },
        {
          "name": "vaultSplFrom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgramFrom"
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultSplTo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgramTo"
              },
              {
                "kind": "account",
                "path": "mintTo"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "caller",
          "signer": true
        },
        {
          "name": "callerSplFrom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "caller"
              },
              {
                "kind": "account",
                "path": "tokenProgramFrom"
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "callerSplTo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "caller"
              },
              {
                "kind": "account",
                "path": "tokenProgramTo"
              },
              {
                "kind": "account",
                "path": "mintTo"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mintFrom"
        },
        {
          "name": "mintTo"
        },
        {
          "name": "tokenProgramFrom"
        },
        {
          "name": "tokenProgramTo"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "ledger",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  95,
                  108,
                  101,
                  100,
                  103,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "instructionsSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "startSwapDriftV2",
      "discriminator": [
        2
      ],
      "accounts": [
        {
          "name": "vault"
        },
        {
          "name": "vaultSplSubstitute",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgramSubstitute"
              },
              {
                "kind": "account",
                "path": "mintSubstitute"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultSplFrom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgramFrom"
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "caller",
          "signer": true
        },
        {
          "name": "callerSplSubstitute",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "caller"
              },
              {
                "kind": "account",
                "path": "tokenProgramSubstitute"
              },
              {
                "kind": "account",
                "path": "mintSubstitute"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "callerSplFrom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "caller"
              },
              {
                "kind": "account",
                "path": "tokenProgramFrom"
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "callerSplTo"
        },
        {
          "name": "mintSubstitute"
        },
        {
          "name": "mintFrom"
        },
        {
          "name": "driftUser",
          "writable": true
        },
        {
          "name": "driftUserStats",
          "writable": true
        },
        {
          "name": "driftState"
        },
        {
          "name": "driftSpotMarketVaultSubstitute",
          "writable": true
        },
        {
          "name": "driftSpotMarketVaultFrom",
          "writable": true
        },
        {
          "name": "driftSigner"
        },
        {
          "name": "tokenProgramSubstitute"
        },
        {
          "name": "tokenProgramFrom"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "ledger",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  95,
                  108,
                  101,
                  100,
                  103,
                  101,
                  114,
                  95,
                  118,
                  50
                ]
              },
              {
                "kind": "account",
                "path": "mintFrom"
              }
            ]
          }
        },
        {
          "name": "driftProgram",
          "address": "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "instructionsSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "driftMarketIndexSubstitute",
          "type": "u16"
        },
        {
          "name": "amountBaseUnitsSubstitute",
          "type": "u64"
        },
        {
          "name": "driftMarketIndexFrom",
          "type": "u16"
        },
        {
          "name": "amountBaseUnitsFrom",
          "type": "u64"
        },
        {
          "name": "driftMarketIndexTo",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "priceUpdateV2",
      "discriminator": [
        34,
        241,
        35,
        99,
        157,
        126,
        244,
        205
      ]
    },
    {
      "name": "spendLimitsOrder",
      "discriminator": [
        15,
        200,
        135,
        116,
        88,
        211,
        171,
        159
      ]
    },
    {
      "name": "state",
      "discriminator": [
        216,
        146,
        107,
        94,
        104,
        75,
        182,
        177
      ]
    },
    {
      "name": "swapLedger",
      "discriminator": [
        104,
        145,
        57,
        221,
        120,
        201,
        62,
        203
      ]
    },
    {
      "name": "swapLedgerV2",
      "discriminator": [
        253,
        153,
        114,
        108,
        2,
        129,
        247,
        174
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    },
    {
      "name": "withdrawOrder",
      "discriminator": [
        17,
        175,
        72,
        133,
        12,
        202,
        254,
        248
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAdminKeypair",
      "msg": "Invalid admin keypair"
    },
    {
      "code": 6001,
      "name": "invalidSpendSettlementAccount",
      "msg": "Invalid spend settlement account"
    },
    {
      "code": 6002,
      "name": "invalidTimestamp",
      "msg": "Invalid timestamp"
    },
    {
      "code": 6003,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6004,
      "name": "illegalSpendLimitsDecrease",
      "msg": "Spend limit cannot be decreased in the increase spend limits instruction"
    },
    {
      "code": 6005,
      "name": "timeLockNotReleased",
      "msg": "Release slot has not passed for time lock"
    },
    {
      "code": 6006,
      "name": "timeLockOrderRentPayerMismatch",
      "msg": "Time lock order rent payers must match"
    },
    {
      "code": 6007,
      "name": "timeLockOwnerMismatch",
      "msg": "Time lock owner mismatch"
    },
    {
      "code": 6008,
      "name": "destinationMismatch",
      "msg": "Destination does not match order destination"
    },
    {
      "code": 6009,
      "name": "invalidDriftMarketIndex",
      "msg": "Unsupported Drift market index"
    },
    {
      "code": 6010,
      "name": "mismatchedDriftMarketIndexMint",
      "msg": "Mint does not match Drift market index"
    },
    {
      "code": 6011,
      "name": "invalidSpendLimitTimeframe",
      "msg": "Spend limit timeframe cannot be 0"
    },
    {
      "code": 6012,
      "name": "invalidAmountBaseUnits",
      "msg": "Amount base units must be greater than 0"
    },
    {
      "code": 6013,
      "name": "missingDestinationSpl",
      "msg": "destination_spl is required if spl_mint is not wSOL"
    },
    {
      "code": 6014,
      "name": "tokenNotSpendable",
      "msg": "Token is not spendable"
    },
    {
      "code": 6015,
      "name": "insufficientTimeframeSpendLimit",
      "msg": "Insufficient spend limit remaining in timeframe"
    },
    {
      "code": 6016,
      "name": "insufficientTransactionSpendLimit",
      "msg": "Insufficient spend limit per transaction"
    },
    {
      "code": 6017,
      "name": "requiredInstructionNotFound",
      "msg": "Required Pyra instruction not found in transaction introspection"
    },
    {
      "code": 6018,
      "name": "illegalCpi",
      "msg": "Cannot call introspection instructions through a CPI"
    },
    {
      "code": 6019,
      "name": "swapOwnerMismatch",
      "msg": "Owner mismatch between start and execute swap instructions"
    },
    {
      "code": 6020,
      "name": "swapVaultMismatch",
      "msg": "Vault mismatch between start and end swap instructions"
    },
    {
      "code": 6021,
      "name": "swapCallerMismatch",
      "msg": "Caller mismatch between start and execute swap instructions"
    },
    {
      "code": 6022,
      "name": "swapCallerSplToMismatch",
      "msg": "Caller SPL ATA for 'to' asset mismatch between start and end swap instructions"
    },
    {
      "code": 6023,
      "name": "swapMintSubstituteMismatch",
      "msg": "Mint for substitute asset mismatch between start and end swap instructions"
    },
    {
      "code": 6024,
      "name": "swapMintFromMismatch",
      "msg": "Mint from mismatch between start and execute swap instructions"
    },
    {
      "code": 6025,
      "name": "swapMintToMismatch",
      "msg": "Mint to mismatch between start and execute swap instructions"
    },
    {
      "code": 6026,
      "name": "swapPayerMismatch",
      "msg": "Payer mismatch between start and execute swap instructions"
    },
    {
      "code": 6027,
      "name": "negativeOraclePrice",
      "msg": "Oracle prices must be positive"
    },
    {
      "code": 6028,
      "name": "invalidSlippageBps",
      "msg": "Max slippage is set too high"
    },
    {
      "code": 6029,
      "name": "maxSlippageExceeded",
      "msg": "Max slippage exceeded"
    },
    {
      "code": 6030,
      "name": "invalidPriceExponent",
      "msg": "Difference between price exponents must not exceed 12"
    },
    {
      "code": 6031,
      "name": "missingAtaForTokenTransfer",
      "msg": "Missing ATA for token transfer"
    },
    {
      "code": 6032,
      "name": "missingMintForTokenTransfer",
      "msg": "Missing mint for token transfer"
    },
    {
      "code": 6033,
      "name": "unsupportedToken",
      "msg": "Unsupported token"
    },
    {
      "code": 6034,
      "name": "cannotLiquidateFreeCollateral",
      "msg": "Cannot liquidate user with free collateral > 0"
    },
    {
      "code": 6035,
      "name": "insufficientLiquidation",
      "msg": "Free collateral must be above 0 after liquidation"
    },
    {
      "code": 6036,
      "name": "excessiveLiquidation",
      "msg": "Free collateral too high after liquidation"
    },
    {
      "code": 6037,
      "name": "unableToLoadAccountLoader",
      "msg": "Unable to load account loader"
    },
    {
      "code": 6038,
      "name": "withdrawFillTooHigh",
      "msg": "Partial withdraw fill is above requested amount"
    },
    {
      "code": 6039,
      "name": "withdrawFillTooLow",
      "msg": "Partial withdraw fill is too far below requested amount"
    },
    {
      "code": 6040,
      "name": "invalidSpendFeeDestination",
      "msg": "Invalid spend fee destination address"
    },
    {
      "code": 6041,
      "name": "spendFeeTooHigh",
      "msg": "Spend fee is above maximum"
    },
    {
      "code": 6042,
      "name": "missingDepositAddressSpl",
      "msg": "deposit_address_spl is required if not depositing lamports"
    },
    {
      "code": 6043,
      "name": "driftUserStillOpen",
      "msg": "Drift user account must be closed before closing vault"
    },
    {
      "code": 6044,
      "name": "invalidDriftAccountOwner",
      "msg": "Invalid Drift account owner"
    },
    {
      "code": 6045,
      "name": "invalidDriftUserAuthority",
      "msg": "Invalid authority for Drift user account"
    },
    {
      "code": 6046,
      "name": "couldNotLoadDriftSpotMarketData",
      "msg": "Could not load Drift spot market data"
    },
    {
      "code": 6047,
      "name": "invalidDriftSpotMarketAccount",
      "msg": "Invalid Drift spot market account"
    },
    {
      "code": 6048,
      "name": "duplicateDriftMarketIndex",
      "msg": "Duplicate Drift market index while decoding spot market map"
    },
    {
      "code": 6049,
      "name": "immutableDriftSpotMarketAccount",
      "msg": "A Drift spot market account that must be mutable is marked as immutable"
    },
    {
      "code": 6050,
      "name": "invalidDriftOracle",
      "msg": "Invalid Drift oracle"
    },
    {
      "code": 6051,
      "name": "couldNotLoadDriftOracleData",
      "msg": "Could not load Drift oracle data"
    },
    {
      "code": 6052,
      "name": "spotMarketNotFound",
      "msg": "Could not find Drift spot market"
    },
    {
      "code": 6053,
      "name": "driftOracleNotFound",
      "msg": "Could not find Drift oracle"
    },
    {
      "code": 6054,
      "name": "invalidSpotPositionDetected",
      "msg": "Invalid spot position detected"
    },
    {
      "code": 6055,
      "name": "invalidDriftUserAccountData",
      "msg": "Invalid Drift user account data"
    },
    {
      "code": 6056,
      "name": "invalidDriftPoolId",
      "msg": "Invalid Drift pool id"
    },
    {
      "code": 6057,
      "name": "invalidDriftMarginRatio",
      "msg": "Invalid Drift margin ratio"
    },
    {
      "code": 6058,
      "name": "invalidDriftMarginRequirementType",
      "msg": "Only Initial margin requirement type is supported for Drift"
    },
    {
      "code": 6059,
      "name": "swapSubstituteAmountMismatch",
      "msg": "Amount of substitute asset withdrawn does not match amount deposited"
    },
    {
      "code": 6060,
      "name": "invalidDriftSubAccountId",
      "msg": "Drift sub account ID is above the maximum"
    },
    {
      "code": 6061,
      "name": "invalidDriftUserRemainingAccounts",
      "msg": "Must provide all allowed Drift user accounts as remaining accounts to close a vault"
    },
    {
      "code": 6062,
      "name": "invalidDriftUserSeeds",
      "msg": "Invalid Drift user account seeds"
    },
    {
      "code": 6063,
      "name": "invalidSpendAmountBaseUnits",
      "msg": "Spend amount base units must be greater than 0"
    },
    {
      "code": 6064,
      "name": "swapDriftUserMismatch",
      "msg": "Drift user mismatch between start and end swap instructions"
    },
    {
      "code": 6065,
      "name": "missingOwnerSpl",
      "msg": "owner_spl is required if not depositing lamports"
    }
  ],
  "types": [
    {
      "name": "feeStructure",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeTiers",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "feeTier"
                  }
                },
                10
              ]
            }
          },
          {
            "name": "fillerRewardStructure",
            "type": {
              "defined": {
                "name": "orderFillerRewardStructure"
              }
            }
          },
          {
            "name": "referrerRewardEpochUpperBound",
            "type": "u64"
          },
          {
            "name": "flatFillerFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "feeTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeNumerator",
            "type": "u32"
          },
          {
            "name": "feeDenominator",
            "type": "u32"
          },
          {
            "name": "makerRebateNumerator",
            "type": "u32"
          },
          {
            "name": "makerRebateDenominator",
            "type": "u32"
          },
          {
            "name": "referrerRewardNumerator",
            "type": "u32"
          },
          {
            "name": "referrerRewardDenominator",
            "type": "u32"
          },
          {
            "name": "refereeFeeNumerator",
            "type": "u32"
          },
          {
            "name": "refereeFeeDenominator",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "oracleGuardRails",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "priceDivergence",
            "type": {
              "defined": {
                "name": "priceDivergenceGuardRails"
              }
            }
          },
          {
            "name": "validity",
            "type": {
              "defined": {
                "name": "validityGuardRails"
              }
            }
          }
        ]
      }
    },
    {
      "name": "orderFillerRewardStructure",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewardNumerator",
            "type": "u32"
          },
          {
            "name": "rewardDenominator",
            "type": "u32"
          },
          {
            "name": "timeBasedRewardLowerBound",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "priceDivergenceGuardRails",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "markOraclePercentDivergence",
            "type": "u64"
          },
          {
            "name": "oracleTwap5minPercentDivergence",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "priceFeedMessage",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedId",
            "docs": [
              "`FeedId` but avoid the type alias because of compatibility issues with Anchor's `idl-build` feature."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "price",
            "type": "i64"
          },
          {
            "name": "conf",
            "type": "u64"
          },
          {
            "name": "exponent",
            "type": "i32"
          },
          {
            "name": "publishTime",
            "docs": [
              "The timestamp of this price update in seconds"
            ],
            "type": "i64"
          },
          {
            "name": "prevPublishTime",
            "docs": [
              "The timestamp of the previous price update. This field is intended to allow users to",
              "identify the single unique price update for any moment in time:",
              "for any time t, the unique update is the one such that prev_publish_time < t <= publish_time.",
              "",
              "Note that there may not be such an update while we are migrating to the new message-sending logic,",
              "as some price updates on pythnet may not be sent to other chains (because the message-sending",
              "logic may not have triggered). We can solve this problem by making the message-sending mandatory",
              "(which we can do once publishers have migrated over).",
              "",
              "Additionally, this field may be equal to publish_time if the message is sent on a slot where",
              "where the aggregation was unsuccesful. This problem will go away once all publishers have",
              "migrated over to a recent version of pyth-agent."
            ],
            "type": "i64"
          },
          {
            "name": "emaPrice",
            "type": "i64"
          },
          {
            "name": "emaConf",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "priceUpdateV2",
      "docs": [
        "A price update account. This account is used by the Pyth Receiver program to store a verified price update from a Pyth price feed.",
        "It contains:",
        "- `write_authority`: The write authority for this account. This authority can close this account to reclaim rent or update the account to contain a different price update.",
        "- `verification_level`: The [`VerificationLevel`] of this price update. This represents how many Wormhole guardian signatures have been verified for this price update.",
        "- `price_message`: The actual price update.",
        "- `posted_slot`: The slot at which this price update was posted."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "writeAuthority",
            "type": "pubkey"
          },
          {
            "name": "verificationLevel",
            "type": {
              "defined": {
                "name": "verificationLevel"
              }
            }
          },
          {
            "name": "priceMessage",
            "type": {
              "defined": {
                "name": "priceFeedMessage"
              }
            }
          },
          {
            "name": "postedSlot",
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
              "defined": {
                "name": "timeLock"
              }
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
            "name": "nextTimeframeResetTimestamp",
            "docs": [
              "The timestamp at which the next timeframe will reset"
            ],
            "type": "u64"
          },
          {
            "name": "timeframeInSeconds",
            "docs": [
              "The duration of a timeframe in seconds"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "whitelistMint",
            "type": "pubkey"
          },
          {
            "name": "discountMint",
            "type": "pubkey"
          },
          {
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "srmVault",
            "type": "pubkey"
          },
          {
            "name": "perpFeeStructure",
            "type": {
              "defined": {
                "name": "feeStructure"
              }
            }
          },
          {
            "name": "spotFeeStructure",
            "type": {
              "defined": {
                "name": "feeStructure"
              }
            }
          },
          {
            "name": "oracleGuardRails",
            "type": {
              "defined": {
                "name": "oracleGuardRails"
              }
            }
          },
          {
            "name": "numberOfAuthorities",
            "type": "u64"
          },
          {
            "name": "numberOfSubAccounts",
            "type": "u64"
          },
          {
            "name": "lpCooldownTime",
            "type": "u64"
          },
          {
            "name": "liquidationMarginBufferRatio",
            "type": "u32"
          },
          {
            "name": "settlementDuration",
            "type": "u16"
          },
          {
            "name": "numberOfMarkets",
            "type": "u16"
          },
          {
            "name": "numberOfSpotMarkets",
            "type": "u16"
          },
          {
            "name": "signerNonce",
            "type": "u8"
          },
          {
            "name": "minPerpAuctionDuration",
            "type": "u8"
          },
          {
            "name": "defaultMarketOrderTimeInForce",
            "type": "u8"
          },
          {
            "name": "defaultSpotAuctionDuration",
            "type": "u8"
          },
          {
            "name": "exchangeStatus",
            "type": "u8"
          },
          {
            "name": "liquidationDuration",
            "type": "u8"
          },
          {
            "name": "initialPctToLiquidate",
            "type": "u16"
          },
          {
            "name": "maxNumberOfSubAccounts",
            "type": "u16"
          },
          {
            "name": "maxInitializeUserFee",
            "type": "u16"
          },
          {
            "name": "featureBitFlags",
            "type": "u8"
          },
          {
            "name": "lpPoolFeatureBitFlags",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "swapLedger",
      "docs": [
        "Ledger for tracking the balance changes of each token before and after a swap, to avoid any dust being left behind after deposit/withdraw"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "docs": [
              "The amount of the token being swapped from"
            ],
            "type": "u64"
          },
          {
            "name": "to",
            "docs": [
              "The amount of the token being swapped to"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "swapLedgerV2",
      "docs": [
        "Ledger for tracking the balance changes of each token before and after a swap, to avoid any dust being left behind after deposit/withdraw"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "substituteDeposit",
            "docs": [
              "The amount of the substitute collateral deposited"
            ],
            "type": "u64"
          },
          {
            "name": "fromWithdrawal",
            "docs": [
              "The amount of the \"from\" asset withdrawn"
            ],
            "type": "u64"
          },
          {
            "name": "toAtaStartingBalance",
            "docs": [
              "The starting balance of the \"to\" asset ATA, used to calculate how much was received in the swap"
            ],
            "type": "u64"
          },
          {
            "name": "healthBeforeSwap",
            "docs": [
              "The starting account health before the swap"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "timeLock",
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
            "type": "pubkey"
          },
          {
            "name": "payer",
            "docs": [
              "Whether the owner is the payer of the rent"
            ],
            "type": "pubkey"
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
    },
    {
      "name": "validityGuardRails",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "slotsBeforeStaleForAmm",
            "type": "i64"
          },
          {
            "name": "slotsBeforeStaleForMargin",
            "type": "i64"
          },
          {
            "name": "confidenceIntervalMaxSize",
            "type": "u64"
          },
          {
            "name": "tooVolatileRatio",
            "type": "i64"
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
              "Note: If the owner becomes changeable in the future, need to add has_one contstraints to all ixs"
            ],
            "type": "pubkey"
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
    },
    {
      "name": "verificationLevel",
      "docs": [
        "Pyth price updates are bridged to all blockchains via Wormhole.",
        "Using the price updates on another chain requires verifying the signatures of the Wormhole guardians.",
        "The usual process is to check the signatures for two thirds of the total number of guardians, but this can be cumbersome on Solana because of the transaction size limits,",
        "so we also allow for partial verification.",
        "",
        "This enum represents how much a price update has been verified:",
        "- If `Full`, we have verified the signatures for two thirds of the current guardians.",
        "- If `Partial`, only `num_signatures` guardian signatures have been checked.",
        "",
        "# Warning",
        "Using partially verified price updates is dangerous, as it lowers the threshold of guardians that need to collude to produce a malicious price update."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "partial",
            "fields": [
              {
                "name": "numSignatures",
                "type": "u8"
              }
            ]
          },
          {
            "name": "full"
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
              "defined": {
                "name": "timeLock"
              }
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
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
