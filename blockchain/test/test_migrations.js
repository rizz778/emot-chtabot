const Migrations = artifacts.require("Migrations");

contract("Migrations", (accounts) => {
  let migrations;
  let newMigrations;

  before(async () => {
    migrations = await Migrations.new();
    newMigrations = await Migrations.new();
  });

  it("should set the last completed migration", async () => {
    await migrations.setCompleted(42);
    const lastCompleted = await migrations.last_completed_migration();
    assert.equal(lastCompleted, 42, "Last completed migration not set correctly");
  });

  it("should upgrade to a new contract", async () => {
    await migrations.upgrade(newMigrations.address);
    const lastCompleted = await newMigrations.last_completed_migration();
    assert.equal(lastCompleted, 42, "Upgrade failed");
  });

  it("should reject upgrade to a non-contract address", async () => {
    try {
      await migrations.upgrade(accounts[0]); // accounts[0] is not a contract
      assert.fail("Upgrade should have failed");
    } catch (error) {
      assert.include(error.message, "Address is not a contract", "Invalid error message");
    }
  });
});