const CrowdFundingContract = artifacts.require('./CrowdFunding');

contract('CrowdFunding', (accounts) =>{
    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = 1000000000000000000;

    const STATE = {
        ongoing: 0,
        failed: 1,
        succed: 2,
        paidOut: 3,
    };

    beforeEach(async () =>{
       contract = await CrowdFundingContract.new(
           "funding",
            1,
            10,
            beneficiary,
            {
                from: contractCreator,
                gas:2000000
            }
       );
    });

    it('contract is initialized', async () =>{

        let campaignName = await contract.name.call()
        expect(campaignName).to.equal('funding');

        let targetAmount = await contract.targetAmount.call()
        expect(Number(targetAmount)).to.equal(ONE_ETH);

        let actualBeneficiary = await contract.beneficiary.call()
        expect(actualBeneficiary).to.equal(beneficiary);

        // let state = await contract.state.call()
        // expect(state.valueOf()).to.equal(STATE.ongoing);

    });

    it("founds are contributed", async () =>{
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        });

        let contributed = await contract.amounts
            .call(contractCreator);
        expect(Number(contributed)).to.equal(ONE_ETH);

        let totalCollected = await contract.totalCollected.call();
        expect(Number(totalCollected)).to.equal(ONE_ETH);
    });

})