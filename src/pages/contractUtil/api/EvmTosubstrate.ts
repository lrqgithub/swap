import {
  ethers,
  abi,
} from "../common";
import {u8aToHex} from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
  

const options = {
  gasLimit: 3000000,
  gasPrice: 10000,
};

type EthereumProviderEip1193 = {
  request: (args: {
    method: string
    params?: unknown[] | object
  }) => Promise<unknown>
}
type substrateToEvmProps = {
  isProvider: EthereumProviderEip1193| undefined,
  receiver: string,
  amount: string,
  cb: Callback
}

export const withdrawBalance = async ({
  isProvider,
  receiver,
  amount,
  cb,
}: substrateToEvmProps) => {
  try {
    if(isProvider){
      const provider =await new ethers.providers.Web3Provider(isProvider);
      const signer = provider.getSigner();

      const address=u8aToHex(decodeAddress(receiver))
      const amountS = ethers.BigNumber.from(amount + "0".repeat(12));
      const precompile = "0x0000000000000000000000000000000000000801";
      let icontract = new ethers.Contract(precompile, abi, provider);
  
      let tx = await icontract.connect(signer).withdrawBalance(address, amountS, options)
  
      console.log("transaction info:")
      console.table(tx);
  
      console.log("waiting...")
      let receipt = await tx.wait();
  
      console.log("transaction receipt:")
      console.table(receipt);
      localStorage.setItem('evmHash', tx.hash)
      cb.success(tx.hash);
    }

    // await call.signAndSend(
    //   address, { signer: injector.signer }, (result: any) => txLog(result, cb.success),
    // );
  } catch (error:any) {
    cb.error(error);
  }
};
