// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract InvoiceEscrow is ReentrancyGuard {
    enum Status { Created, Accepted, Completed, Cancelled }

    struct Invoice {
        address supplier;
        address buyer;
        string  title;
        string  description;
        uint256 amount;         // payment amount in wei
        uint256 deadline;       // UNIX timestamp by which buyer must accept
        uint256 supplierStake;  // stake amount in wei
        Status  status;
    }

    mapping(uint256 => Invoice) public invoices;
    uint256 public nextId;

    event InvoiceCreated(
        uint256 indexed id,
        address indexed supplier,
        uint256 amount,
        uint256 supplierStake,
        uint256 deadline
    );
    event InvoiceAccepted(uint256 indexed id, address indexed buyer);
    event InvoiceCompleted(uint256 indexed id);
    event InvoiceCancelled(uint256 indexed id);

    /// @notice Supplier creates an invoice and stakes TRBTC as collateral.
    /// @param title Short title of the task.
    /// @param description Detailed description of the task.
    /// @param amount Payment amount (in wei) the buyer must pay.
    /// @param deadline UNIX timestamp before which the buyer must accept.
    /// @return invoiceId The newly created invoice’s ID.
    function createInvoice(
        string calldata title,
        string calldata description,
        uint256 amount,
        uint256 deadline
    )
        external
        payable
        nonReentrant
        returns (uint256 invoiceId)
    {
        require(msg.value > 0, "Must stake > 0");
        require(deadline > block.timestamp, "Deadline must be future");

        invoiceId = nextId++;
        invoices[invoiceId] = Invoice({
            supplier:      msg.sender,
            buyer:         address(0),
            title:         title,
            description:   description,
            amount:        amount,
            deadline:      deadline,
            supplierStake: msg.value,
            status:        Status.Created
        });

        emit InvoiceCreated(invoiceId, msg.sender, amount, msg.value, deadline);
    }

    /// @notice Buyer accepts the invoice by staking the same amount + paying `amount`.
    /// @param id The invoice ID to accept.
    function acceptInvoice(uint256 id)
        external
        payable
        nonReentrant
    {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Created,        "Not available");
        require(block.timestamp <= inv.deadline,     "Deadline passed");
        require(msg.sender != inv.supplier,          "Supplier cannot accept");
        // Buyer must send exactly supplierStake + amount
        require(
            msg.value == inv.supplierStake + inv.amount,
            "Must send stake + payment"
        );

        inv.buyer  = msg.sender;
        inv.status = Status.Accepted;

        emit InvoiceAccepted(id, msg.sender);
    }

    /// @notice Supplier marks the invoice completed, triggering payouts.
    /// @param id The invoice ID to complete.
    function markCompleted(uint256 id)
        external
        nonReentrant
    {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Accepted,      "Not accepted");
        require(msg.sender == inv.supplier,         "Only supplier");

        inv.status = Status.Completed;

        // Return supplier stake + payment to supplier
        uint256 supplierPayout = inv.supplierStake + inv.amount;
        // Return buyer stake back to buyer
        uint256 buyerRefund    = inv.supplierStake;

        payable(inv.supplier).transfer(supplierPayout);
        payable(inv.buyer).transfer(buyerRefund);

        emit InvoiceCompleted(id);
    }

    /// @notice Supplier can cancel if nobody accepts by the deadline, reclaiming their stake.
    /// @param id The invoice ID to cancel.
    function cancelInvoice(uint256 id)
        external
        nonReentrant
    {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Created,      "Cannot cancel");
        require(msg.sender == inv.supplier,        "Only supplier");
        require(block.timestamp > inv.deadline,    "Deadline not yet passed");

        inv.status = Status.Cancelled;
        payable(inv.supplier).transfer(inv.supplierStake);

        emit InvoiceCancelled(id);
    }
}
