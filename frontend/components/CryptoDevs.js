import { providers, ethers, utils } from "ethers";
import { useState, useEffect, useRef } from "react";
import web3Modal from "web3modal";
import { contractAddresses, abi } from "../constants";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function cryptodevs() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const web3ModalRef = useRef();

  async function getSigner() {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      // throw new Error("Change network to Goerli");
    }

    return signer;
  }

  async function connectWallet() {
    try {
      await getSigner();
      setWalletConnected(true);
    } catch (err) {
      console.log(err);
    }
  }

  async function presaleMint() {
    try {
      const signer = await getSigner();
      const nftContract = new ethers.Contract(
        contractAddresses[5][0],
        abi,
        signer
      );

      const tx = await nftContract.preSaleMint({
        value: utils.parseEther("0.012"),
      });

      setLoading(true);
      await tx.wait();
      setLoading(false);

      window.alert("You successfully minted a Crypto Dev");
    } catch (err) {
      console.log(err);
    }
  }

  async function publicMint() {
    try {
      const signer = await getSigner();
      const nftContract = new ethers.Contract(
        contractAddresses[5][0],
        abi,
        signer
      );

      const tx = await nftContract.mint({ value: utils.parseEther("0.012") });

      setLoading(true);
      await tx.wait();
      setLoading(false);

      window.alert("You successfully minted a Crypto Dev");
    } catch (err) {
      console.log(err);
    }
  }

  async function startPresale() {
    try {
      const signer = await getSigner();
      const nftContract = new ethers.Contract(
        contractAddresses[5][0],
        abi,
        signer
      );

      const tx = await nftContract.startPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);

      await checkIfPresaleStarted();
    } catch (err) {
      console.log(err);
    }
  }

  async function checkIfPresaleStarted() {
    try {
      const signer = await getSigner();
      const nftContract = new ethers.Contract(
        contractAddresses[5][0],
        abi,
        signer
      );

      const _presaleStarted = await nftContract.presaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async function checkIfPresaleEnded() {
    try {
      const signer = await getSigner();
      const nftContract = new ethers.Contract(
        contractAddresses[5][0],
        abi,
        signer
      );

      const _presaleEnded = await nftContract.presaleEnded();
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000)); // lt is less than function. since date.now() is a big number we can not use the sign <.

      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }

      return hasEnded;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async function getOwner() {
    try {
      const signer = await getSigner();
      const nftContract = new ethers.Contract(
        contractAddresses[5][0],
        abi,
        signer
      );

      const _owner = await nftContract.owner();
      const address = await signer.getAddress();

      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function getTokenIdsMinted() {
    const signer = await getSigner();
    const nftContract = new ethers.Contract(
      contractAddresses[5][0],
      abi,
      signer
    );

    const _tokenIds = await nftContract.tokenIds();
    setTokenIdsMinted(_tokenIds.toString());
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }

      getTokenIdsMinted();

      // Set an interval which gets called every 5 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wallet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    // If connected user is the owner, and presale hasn't started yet, allow them to start the presale
    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }

    // If connected user is not the owner but presale hasn't started yet, tell them that
    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale has not started!</div>
        </div>
      );
    }

    // If presale started, but hasn't ended yet, allow for minting during the presale period
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    // If presale started and has ended, its time for public minting
    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Tarang Tyagi
      </footer>
    </div>
  );
}
