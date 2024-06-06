document.addEventListener("DOMContentLoaded", function() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');

        const connectButton = document.getElementById('connectButton');
        const walletAddress = document.getElementById('walletAddress');

        connectButton.addEventListener('click', async () => {
            try {
                // Request account access if needed
                await ethereum.request({ method: 'eth_requestAccounts' });

                // We now have access to the user's wallet
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.getAccounts();
                walletAddress.textContent = `Connected Wallet: ${accounts[0]}`;
                console.log(`Connected Wallet: ${accounts[0]}`);
            } catch (error) {
                console.error('User denied account access or error occurred:', error);
            }
        });
    } else {
        alert('MetaMask is not installed. Please install MetaMask to use this feature.');
    }
});




// --------------------------- adding trasnfer function

document.addEventListener("DOMContentLoaded", function() {
    const tokenAddress = {
        'Ethereum': '0x1c3547dfa9ce7acd9c54ae49244575fa65bc75e2',
        'BSC': '0x2e156a3e09782A785345B7A33c46C71596FFd551',
        'Solana': 'EZGB14NYbqMrsw1QKSgfLXKpj8PrnQBXSjWHbwxpvbAy'
    };

    let web3;
    let userAccount;
    let tokenABI;

    const connectButton = document.getElementById('connectButton');
    const walletAddress = document.getElementById('walletAddress');
    const transferButton = document.getElementById('transferButton');
    const transferStatus = document.getElementById('transferStatus');
    const networkSelect = document.getElementById('networkSelect');

    connectButton.addEventListener('click', async () => {
        const selectedNetwork = networkSelect.value;

        if (selectedNetwork === 'Solana') {
            alert('Solana wallet connection not implemented yet.');
            return;
        }

        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            userAccount = accounts[0];
            walletAddress.textContent = `Connected Wallet: ${userAccount}`;
            console.log(`Connected Wallet: ${userAccount}`);
        } catch (error) {
            console.error('User denied account access or error occurred:', error);
        }
    });

    // Load the ABI file
    fetch('tokenABI.json')
        .then(response => response.json())
        .then(data => {
            tokenABI = data;
            console.log('Token ABI loaded:', tokenABI);
        })
        .catch(error => {
            console.error('Error loading token ABI:', error);
            transferStatus.textContent = 'Failed to load token ABI.';
        });

    transferButton.addEventListener('click', async () => {
        const recipientAddress = document.getElementById('recipientAddress').value;
        const tokenAmount = document.getElementById('tokenAmount').value;
        const selectedNetwork = networkSelect.value;

        if (selectedNetwork === 'Solana') {
            transferSolanaToken(recipientAddress, tokenAmount);
            return;
        }

        if (!web3 || !userAccount) {
            transferStatus.textContent = 'Please connect your wallet first.';
            return;
        }

        if (!tokenABI) {
            transferStatus.textContent = 'Token ABI not loaded yet.';
            return;
        }

        const contractAddress = tokenAddress[selectedNetwork];
        const tokenContract = new web3.eth.Contract(tokenABI, contractAddress);

        try {
            await tokenContract.methods.transfer(recipientAddress, web3.utils.toWei(tokenAmount, 'ether')).send({ from: userAccount });
            transferStatus.textContent = 'Transfer successful!';
        } catch (error) {
            console.error('Error during token transfer:', error);
            transferStatus.textContent = 'Transfer failed. Check console for details.';
        }
    });

    async function transferSolanaToken(recipientAddress, tokenAmount) {
        try {
            const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
            const fromWallet = solanaWeb3.Keypair.generate();
            const toWallet = new solanaWeb3.PublicKey(recipientAddress);
            const mintPublicKey = new solanaWeb3.PublicKey(tokenAddress['Solana']);
            const tokenAmountInLamports = parseFloat(tokenAmount) * Math.pow(10, 9);

            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.Token.createTransferInstruction(
                    solanaWeb3.TOKEN_PROGRAM_ID,
                    fromWallet.publicKey,
                    toWallet,
                    fromWallet.publicKey,
                    [],
                    tokenAmountInLamports
                )
            );

            const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [fromWallet]);

            transferStatus.textContent = 'Transfer successful! Transaction signature: ' + signature;
        } catch (error) {
            console.error('Error during Solana token transfer:', error);
            transferStatus.textContent = 'Solana transfer failed. Check console for details.';
        }
    }
});
