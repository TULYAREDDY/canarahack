# POL Token Setup Guide for Polygon Amoy Testnet

This guide ensures your application is properly configured to use **POL** tokens on the **Polygon Amoy testnet**.

## ✅ Required Configuration Checklist

### 1. MetaMask Network Configuration
- **Chain ID**: `80002` (0x13882 in hex)
- **Network Name**: Polygon Amoy Testnet
- **Currency Symbol**: `POL` (not MATIC)
- **RPC URL**: `https://rpc-amoy.polygon.technology`
- **Block Explorer**: `https://amoy.polygonscan.com/`

### 2. Get POL Tokens
- **Faucet URL**: https://faucet.polygon.technology/
- **Token**: POL (Polygon's native token)
- **Purpose**: Gas fees for transactions

### 3. Code Configuration
Your application is already configured correctly:
- ✅ Uses Chain ID 80002
- ✅ Uses official Amoy RPC
- ✅ No MATIC hardcoding found
- ✅ Proper POL currency configuration

## 🔧 Manual MetaMask Setup

If automatic network switching doesn't work, manually add the network:

1. Open MetaMask
2. Click the network dropdown
3. Select "Add Network" → "Add Network Manually"
4. Enter these details:
   ```
   Network Name: Polygon Amoy Testnet
   New RPC URL: https://rpc-amoy.polygon.technology
   Chain ID: 80002
   Currency Symbol: POL
   Block Explorer URL: https://amoy.polygonscan.com/
   ```

## 🚨 Common Issues & Solutions

### Issue: "Insufficient funds for gas"
**Solution**: Get POL from the faucet at https://faucet.polygon.technology/

### Issue: "Wrong network"
**Solution**: Use the "Switch to Amoy Testnet" button in the app

### Issue: "Transaction failed"
**Solution**: Ensure you have enough POL for gas fees (recommend 0.1+ POL)

### Issue: "Currency shows as MATIC"
**Solution**: Verify you're on Chain ID 80002, not 137 (Polygon mainnet)

## 🔍 Verification Steps

1. **Check Network**: MetaMask should show "Polygon Amoy Testnet"
2. **Check Currency**: Should display "POL" not "MATIC"
3. **Check Chain ID**: Should be 80002
4. **Check Balance**: Should have POL balance > 0
5. **Test Transaction**: Try a small transaction to verify setup

## 📱 Application Features

The enhanced HoneytokenViewer now includes:
- ✅ Automatic POL configuration verification
- ✅ Real-time balance display
- ✅ One-click network switching
- ✅ Direct faucet link
- ✅ Transaction status monitoring

## 🛠️ Technical Details

### Network Configuration
```javascript
const AMOY_CONFIG = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/']
};
```

### Contract Address
- **Registry**: `0x658c483FF3413A06ed269cDd9BACFB5193cfE960`
- **Network**: Polygon Amoy Testnet
- **Explorer**: https://amoy.polygonscan.com/address/0x658c483FF3413A06ed269cDd9BACFB5193cfE960

## 🎯 Success Indicators

When properly configured, you should see:
- ✅ Green checkmarks in the POL Configuration section
- ✅ POL balance displayed
- ✅ "Register on-chain" button enabled
- ✅ Successful transactions on Amoy Polygonscan

## 📞 Support

If you encounter issues:
1. Check the POL Configuration status in the app
2. Verify MetaMask network settings
3. Ensure sufficient POL balance
4. Check transaction status on Amoy Polygonscan 