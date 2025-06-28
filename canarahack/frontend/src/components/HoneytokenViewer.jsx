import React, { useState, useEffect } from 'react';
import { getWithAuth } from './api.js';
import { contractRead, CONTRACT_ADDRESS, ABI } from '../chain/registry';
import { ethers } from 'ethers';
import { verifyAmoySetup, switchToAmoy, getAmoyFaucetUrl, getPolBalance } from '../utils/pol-verification.js';

function HoneytokenViewer({ addLog, onResult }) {
  const [honeytoken, setHoneytoken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkValue, setCheckValue] = useState('');
  const [checkResult, setCheckResult] = useState(null); // null, true, or false
  const [checking, setChecking] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [polSetup, setPolSetup] = useState(null);
  const [polBalance, setPolBalance] = useState('0');

  useEffect(() => {
    setHasMetaMask(typeof window.ethereum !== 'undefined');
    if (typeof window.ethereum !== 'undefined') {
      verifyPolSetup();
    }
  }, []);

  const verifyPolSetup = async () => {
    const setup = await verifyAmoySetup();
    setPolSetup(setup);
    
    if (setup.correctNetwork) {
      const balance = await getPolBalance();
      setPolBalance(balance);
    }
  };

  useEffect(() => {
    if (honeytoken && honeytoken.record_id) {
      setCheckValue(honeytoken.record_id);
    }
  }, [honeytoken]);

  const handleSwitchToAmoy = async () => {
    const result = await switchToAmoy();
    if (result.success) {
      addLog('✅ Switched to Amoy testnet', 'success');
      await verifyPolSetup();
    } else {
      addLog(`❌ ${result.message}`, 'error');
    }
  };

  const fetchHoneytoken = async () => {
    setLoading(true);
    setError('');
    setHoneytoken(null);
    try {
      const { ok, data } = await getWithAuth('/generate_honeytoken');
      if (ok) {
        setHoneytoken(data);
        addLog('✔️ Honeytoken generated', 'success');
        if (onResult) onResult(data);
      } else {
        setError(data.error || 'Error fetching honeytoken');
        addLog(`❌ Honeytoken request failed (${data.error || 'error'})`, 'error');
      }
    } catch (err) {
      setError('Network error');
      addLog('❌ Honeytoken request failed (network error)', 'error');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (honeytoken) {
      navigator.clipboard.writeText(JSON.stringify(honeytoken, null, 2));
      addLog('Copied honeytoken to clipboard', 'info');
    }
  };

  // On-chain check
  const handleCheck = async () => {
    setChecking(true);
    setCheckResult(null);
    setRegisterError('');
    setTxHash('');
    try {
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(checkValue));
      const result = await contractRead.isRegistered(hash);
      setCheckResult(result);
    } catch (err) {
      setCheckResult(false);
      setRegisterError('Error checking on-chain status');
    }
    setChecking(false);
  };

  // On-chain register
  const handleRegister = async () => {
    setRegistering(true);
    setRegisterError('');
    setTxHash('');
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Force switch to Amoy
      const amoyChainId = '0x13882'; // 80002 in hex
      if (window.ethereum.networkVersion !== '80002') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: amoyChainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: amoyChainId,
                  chainName: 'Polygon Amoy Testnet',
                  rpcUrls: ['https://rpc-amoy.polygon.technology'],
                  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractWrite = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(checkValue));
      const tx = await contractWrite.registerHoneytoken(hash, 'added via UI');
      setTxHash(tx.hash);
      await tx.wait();
      setCheckResult(true);
      addLog('✔️ Registered on-chain', 'success');
    } catch (err) {
      if (err && err.message && err.message.includes('Already registered')) {
        setRegisterError('Token already on-chain');
      } else if (err && err.data && err.data.message && err.data.message.includes('Already registered')) {
        setRegisterError('Token already on-chain');
      } else {
        setRegisterError(err.message || 'Error registering on-chain');
      }
    }
    setRegistering(false);
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <h3>Honeytoken Viewer</h3>
      
      {/* POL Configuration Status */}
      {hasMetaMask && (
        <div className="mb-4 p-4 border rounded bg-blue-50">
          <div className="font-semibold mb-2">🔗 Polygon Amoy (POL) Configuration</div>
          {polSetup ? (
            <div className="space-y-1 text-sm">
              <div className="flex items-center">
                <span className={polSetup.metamask ? "text-green-600" : "text-red-600"}>
                  {polSetup.metamask ? "✅" : "❌"} MetaMask
                </span>
              </div>
              <div className="flex items-center">
                <span className={polSetup.correctNetwork ? "text-green-600" : "text-red-600"}>
                  {polSetup.correctNetwork ? "✅" : "❌"} Connected to Amoy (Chain ID: 80002)
                </span>
              </div>
              <div className="flex items-center">
                <span className={polSetup.correctCurrency ? "text-green-600" : "text-red-600"}>
                  {polSetup.correctCurrency ? "✅" : "❌"} Currency: POL
                </span>
              </div>
              {polSetup.correctNetwork && (
                <div className="flex items-center">
                  <span className={polSetup.hasBalance ? "text-green-600" : "text-yellow-600"}>
                    {polSetup.hasBalance ? "✅" : "⚠️"} Balance: {parseFloat(polBalance).toFixed(4)} POL
                  </span>
                </div>
              )}
              
              {!polSetup.correctNetwork && (
                <div className="mt-2">
                  <button
                    onClick={handleSwitchToAmoy}
                    className="rounded border p-2 bg-blue-500 text-white text-sm"
                  >
                    Switch to Amoy Testnet
                  </button>
                </div>
              )}
              
              {polSetup.correctNetwork && !polSetup.hasBalance && (
                <div className="mt-2">
                  <a
                    href={getAmoyFaucetUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Get POL from Amoy Faucet →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600">Checking configuration...</div>
          )}
        </div>
      )}

      <button onClick={fetchHoneytoken} disabled={loading} className="rounded border p-2 bg-blue-500 text-white">
        {loading ? 'Loading...' : 'Generate Honeytoken'}
      </button>
      {honeytoken && (
        <div style={{ marginTop: '1em', background: '#f3f3f3', padding: '1em', borderRadius: 6 }}>
          <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify(honeytoken, null, 2)}</pre>
          <button onClick={handleCopy} className="rounded border p-2 bg-blue-100 text-black mt-2 text-sm">Copy Result</button>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}

      {/* On-chain check UI */}
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <div className="mb-2 font-semibold">Check / Register on-chain</div>
        <input
          className="rounded border p-2 mr-2 w-64"
          type="text"
          value={checkValue}
          onChange={e => setCheckValue(e.target.value)}
          placeholder="Paste honeytoken string"
        />
        <button
          onClick={handleCheck}
          disabled={checking || !checkValue}
          className="rounded border p-2 bg-blue-500 text-white mr-2"
        >
          {checking ? 'Checking...' : 'Check'}
        </button>
        {checkResult === true && <span className="text-green-600 font-bold ml-2">✅ Registered</span>}
        {checkResult === false && <span className="text-red-600 font-bold ml-2">❌ Not Registered</span>}
        {registerError && <div className="text-red-600 mt-2">{registerError}</div>}
        {/* Register on-chain button if MetaMask is present */}
        {hasMetaMask && checkResult === false && polSetup?.correctNetwork && (
          <button
            onClick={handleRegister}
            disabled={registering}
            className="rounded border p-2 bg-green-600 text-white ml-2"
          >
            {registering ? 'Awaiting confirmation…' : 'Register on-chain'}
          </button>
        )}
        {txHash && (
          <div className="mt-2 text-blue-700">
            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View transaction on Polygonscan
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default HoneytokenViewer; 