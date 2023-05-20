import { USElection__factory } from "./../typechain-types/factories/Election.sol/USElection__factory";
import { USElection } from "./../typechain-types/Election.sol/USElection";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("USElection", function () {
    let usElectionFactory;
    let usElection: USElection;

    let accounts: any;

    before(async () => {
        usElectionFactory = await ethers.getContractFactory("USElection");

        usElection = await usElectionFactory.deploy();

        await usElection.deployed();

        accounts = await ethers.getSigners();
    });

    it("Should return the current leader before submit any election results", async function () {
        expect(await usElection.currentLeader()).to.equal(0); // NOBODY
    });

    it("Should return the election status", async function () {
        expect(await usElection.electionEnded()).to.equal(false); // Not Ended
    });

    it("Should submit state results and get current leader", async function () {
        const stateResults: any = ["California", 1000, 900, 32];

        const submitStateResultsTx = await usElection.submitStateResult(
            stateResults
        );
        await submitStateResultsTx.wait();

        //New
        await expect(submitStateResultsTx).to.emit(usElection, "LogStateResult").withArgs(1, 32, "California"); // BIDEN

        expect(await usElection.currentLeader()).to.equal(1); // BIDEN
    });

    it("Should throw when try to submit already submitted state results", async function () {
        const stateResults: any = ["California", 1000, 900, 32];

        //Fixed
        await expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
            "This state result was already submitted!"
        );
    });

    it("Should submit state results and get current leader", async function () {
        const stateResults: any = ["Ohaio", 800, 1200, 33];

        const submitStateResultsTx = await usElection.submitStateResult(
            stateResults
        );

        await submitStateResultsTx.wait();

        expect(await usElection.currentLeader()).to.equal(2); // TRUMP
    });

    //New
    it("Should throw if state seats are zero", async function () {
        const stateResults: any = ["Ohaio", 800, 1200, 0];

        await expect(usElection.submitStateResult(stateResults)).to.be.revertedWith("States must have at least 1 seat");
    });

    //New
    it("Should throw if state results are equal", async function () {
        const stateResults: any = ["Ohaio", 1000, 1000, 33];

        await expect(usElection.submitStateResult(stateResults)).to.be.revertedWith("There cannot be a tie");
    });

    it("Should end the elections, get the leader and election status", async function () {
        const endElectionTx = await usElection.endElection();
        await endElectionTx.wait();

        //New
        await expect(endElectionTx).to.emit(usElection, "LogElectionEnded").withArgs(2); // TRUMP

        expect(await usElection.currentLeader()).to.equal(2); // TRUMP
        expect(await usElection.electionEnded()).to.equal(true); // Ended
    });

    //TODO: ADD YOUR TESTS
    it("Should throw if not owner is trying to submit state results", async function () {
        const stateResults: any = ["Ohaio", 800, 1200, 33];

        await expect(usElection.connect(accounts[1]).submitStateResult(stateResults)).to.be.revertedWith("Not invoked by the owner");
    });

    it("Should throw if try to submit state results when election has ended", async function () {
        const stateResults: any = ["Ohaio", 800, 1200, 33];

        await expect(usElection.submitStateResult(stateResults)).to.be.revertedWith("The election has ended already");
    });

    it("Should throw if try to end the election when it has ended already", async function () {
        await expect(usElection.endElection()).to.be.revertedWith("The election has ended already");
    });

    it("Should throw if not owner try to end the election", async function () {
        await expect(usElection.connect(accounts[1]).endElection()).to.be.revertedWith("Not invoked by the owner");
    });
});
