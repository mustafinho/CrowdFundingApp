const CrowdFundingContract = artifacts.require('./TestCrowdFunding');

contract('CrowdFunding', (accounts) =>{
    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = 1000000000000000000;

    const ERROR_MSG = 'Returned error: VM Exception while processing transaction: revert';

    const STATE = {
        ongoing: 0,
        failed: 1,
        succed: 2,
        paidOut: 3,
    };
    ///@dev: deploying the smart contract. passing the name, the amount of ehter, the duration time and the beneficiary to the constructor.
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

    ///@dev: checks that al the fields in the smart contract were initialized correctly
    it('contract is initialized', async () =>{

        let campaignName = await contract.name.call()
        expect(campaignName).to.equal('funding');

        let targetAmount = await contract.targetAmount.call()
        expect(Number(targetAmount)).to.equal(ONE_ETH);

        let actualBeneficiary = await contract.beneficiary.call()
        expect(actualBeneficiary).to.equal(beneficiary);

        let fundingDeadLine = await contract.fundingDeadLine.call()
        expect(Number(fundingDeadLine)).to.equal(600)

        let state = await contract.state.call()
        expect(Number(state.valueOf())).to.equal(STATE.ongoing);

    });

    ///@dev: checks if the founds were contributed
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

    it('cannot contribute after deadline', async () =>{
        try{
            await contract.setCurrentTime(601);
            await contract.sendTransaction({
                value: ONE_ETH,
                from: contractCreator
            });
            expect.fail()
        } catch (error) {
            expect(error.message).to.equal(ERROR_MSG);
        }
    });

    it('crowdfunding succeded', async ()=>{
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        });
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();

        expect(Number(state.valueOf())).to.equal(STATE.succed);
    });

    it('crowdfunding failed', async ()=>{
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();

        expect(Number(state.valueOf())).to.equal(STATE.failed);
    });


    it('collected money paid out', async ()=>{
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        });
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        let initAmount = await web3.eth.getBalance(beneficiary);
        await contract.collect({from: contractCreator})

        let newBalance = await  web3.eth.getBalance(beneficiary);
        expect(newBalance - initAmount).to.equal(ONE_ETH);

        let fundingState = await contract.state.call()
        expect(Number(fundingState.valueOf())).to.equal(STATE.paidOut);
    });

    it('withdraw founds from the contract', async () =>{
        await contract.contribute({
            value: ONE_ETH - 100,
            from: contractCreator
        });
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        
        await contract.withdraw({from: contractCreator});
        let amount = await contract.amounts.call(contractCreator);
        expect(Number(amount)).to.equal(0);
    })

    // it('event is emitted', async ()=>{
    //     let watcher = contract.CampaignFinished();

    //     await contract.setCurrentTime(601);
    //     await contract.finishCrowdFunding();

    //     /*this method returns an array of events, we are subscribing to all the events
    //     that 'watcher' have*/

    //     let events = await watcher.get();
    //     let event = events[0];
    //     expect(Number(event.args.totalCollected)).to.equal(0);
    //     expect(event.arg.suceeded).to.equal(false);
    // })
})