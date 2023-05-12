export interface FormaterParans {
  sessionIdHex: string;
  ruleId: string;
  sender: string;
  receiver?: string;
  token?: string;
  amount?: string;
  packageType: number;
  timestamp: number;
}

private async formaterBabiJubjub(params: FormaterParans) {
    const {
      sessionIdHex,
      ruleId,
      sender,
      receiver,
      token,
      amount,
      packageType,
    } = params;
    const eddsa = await buildEddsa();

    let purefiPackage = '';
    const timestampBn = BigNumber.from(params.timestamp);

    if (packageType === 1) {
      purefiPackage = defaultAbiCoder.encode(
        ['uint8', 'uint256', 'uint256', 'address', 'address'],
        [packageType, +ruleId, sessionIdHex, sender, receiver],
      );
    } else if (packageType === 2) {
      purefiPackage = defaultAbiCoder.encode(
        [
          'uint8',
          'uint256',
          'uint256',
          'address',
          'address',
          'address',
          'uint256',
        ],
        [packageType, ruleId, sessionIdHex, sender, receiver, token, amount],
      );
    }

    const message = solidityPack(
      ['uint64', 'bytes'],
      [timestampBn, purefiPackage],
    );

    const message1 = ethers.utils.arrayify(message);

    const msg = eddsa.babyJub.F.e(Scalar.fromRprLE(message1, 0));
    const prvKey = Buffer.from(this.privateKey, 'hex');
    const signature = eddsa.signPoseidon(prvKey, msg);
    const pSignature = eddsa.packSignature(signature);

    const purefiData = defaultAbiCoder.encode(
      ['uint64', 'bytes', 'bytes'],
      [timestampBn, pSignature, purefiPackage],
    );

    return purefiData;
  }
