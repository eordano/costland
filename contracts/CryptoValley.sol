pragma solidity 0.5.6;


interface ERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
interface ERC721 {
    function ownerOf(uint256) external view returns (address);
    function encodeTokenId(int, int) external pure returns (uint);
    function setUpdateOperator(uint256, address) external;
    function setMetadata(uint256, string calldata) external;
}

contract OwnableStorage {

  address public owner;

  constructor() internal {
    owner = msg.sender;
  }

}
contract ProxyStorage {

  /**
   * Current contract to which we are proxing
   */
  address public currentContract;
  address public proxyOwner;
}

contract CryptoValley is ProxyStorage, OwnableStorage {

    function initialize(bytes memory) public {
    }

    uint256 public DAY = 60 * 60 * 24;
    uint256 public YEAR = DAY * 365;

    // A value of 1 means "the whole amount every second"
    // A value of 1/DAY means "the whole amount every day"
    // A value of 3/YEAR means "300% tax every year"
    // A value of 1/(14*YEAR) means "100% tax every 14 years"
    // A value of 10000/(142857*YEAR) means ~7% tax per year
    uint256 public TAX_NOMINATOR = 10000;
    uint256 public TAX_DENOMINATOR = 142857;

    uint256 public  MIN_INCREASE_NOMINATOR = 10000;
    uint256 public MAX_INCREASE_NOMINATOR = 142857;

    uint256 LOCK_DECREASE_PERIOD = DAY;

    ERC20 public fungibleToken = ERC20(0x2a8Fd99c19271F4F04B1B7b9c4f7cF264b626eDB);
    ERC721 public nftToken = ERC721(0x3c8Ed7eCAd6819fB943992966e36671F33C8DEda);

    address[] public __owner;
    uint256[] public price;
    uint256[] public lockDecrease;
    uint256[] public startDate;
    uint256[] public lastPayment;

    uint256[] public bidPrice;
    address[] public bidOwner;
    uint256[] public bidExpiration;

    uint256[][] public _tokens;

    bool public constant DEPOSIT = true;

    constructor() public {
        require(uint(address(fungibleToken)) != 0);
        require(uint(address(fungibleToken)) != 0);
    }

    event Bid (
        uint256 indexed tokenId,
        uint256 price,
        uint256 gracePeriodEnds,
        address buyer
    );

    event Bought(
        uint256 indexed tokenId,
        uint256 price,
        address buyer
    );

    event BidExpired(
        uint tokenId,
        uint price,
        address bidder
    );

    struct OwnerInfo {
        address who;
        uint[] parcels;
    }

    function getParcelInfo(int x, int y) public view returns (
        int _x,
        int _y,
        uint256 _tokenId,
        uint _price,
        address _owner,
        uint _lock,
        uint _startDate,
        uint _lastPayment,
        uint _taxDue,

        uint _bidPrice,
        uint _bidExpiration,
        address _bidOwner
    ) {
        _x = x;
        _y = y;
        _tokenId = nftToken.encodeTokenId(x, y);
        _price = price[_tokenId];
        _owner = __owner[_tokenId];
        _lock = lockDecrease[_tokenId];
        _startDate = startDate[_tokenId];
        _lastPayment = lastPayment[_tokenId];
        _taxDue = balanceDueForToken(_tokenId, now);

        _bidPrice = bidPrice[_tokenId];
        _bidExpiration = bidExpiration[_tokenId];
        _bidOwner = bidOwner[_tokenId];
    }

    function getOwnerInfo(address who) public view returns (address _who, uint parcelsOwned, uint totalTaxDue) {
        _who = who;
        parcelsOwned = _tokens[uint(who)].length;
        totalTaxDue = balanceDue(who, now);
    }
    
    function collectTaxesNow(address who) public returns (bool) {
        return collectTaxesFrom(who, now);
    }

    /**
     * Allow somebody to buy a token
     */
    function buy(uint256 tokenId, uint256 newPrice) public {
        address buyer = msg.sender;
        collectTaxesFrom(buyer, now);
        if (!existsToken(tokenId)) {
            return;
        }

        address currentOwner = __owner[tokenId];
        if (uint256(currentOwner) != 0) {
            collectTaxesFrom(currentOwner, now);
        }
        currentOwner = __owner[tokenId];

        if (uint(currentOwner) == 0) {
            settleBuyerDeposit(buyer, tokenId, newPrice, now);
            assignTokenTo(buyer, tokenId, newPrice, now);
            emit Bought(tokenId, newPrice, buyer);
        } else if (bidPrice[tokenId] == 0) {
            uint256 gracePeriodEnds = now + calculateGracePeriod(tokenId, now);
            createBid(tokenId, gracePeriodEnds, newPrice, buyer);
        } else {
            revert("conflicting bid active");
        }
    }

    function setMetadata(uint256 token, string memory data) public {
        nftToken.setMetadata(token, data);
    }
    
    function createBid(uint256 tokenId, uint256 gracePeriodEnds, uint256 newPrice, address buyer) internal {
        if (DEPOSIT) require(fungibleToken.transferFrom(buyer, this, newPrice));
        bidPrice[tokenId] = newPrice;
        bidExpiration[tokenId] = gracePeriodEnds;
        bidOwner[tokenId] = buyer;
        emit Bid(tokenId, newPrice, gracePeriodEnds, buyer);
    }

    function clearBid(uint256 tokenId) internal {
        bidPrice[tokenId] = 0;
        bidExpiration[tokenId] = 0;
        bidOwner[tokenId] = address(0);
    }

    function setUpdateOperator(uint256 tokenId, address operator) external {
        require(msg.sender == __owner[tokenId]);
        nftToken.setUpdateOperator(tokenId, operator);
    }

    function rejectBid(uint256 tokenId) public {
        require(msg.sender == __owner[tokenId]);
        address _bidder = bidOwner[tokenId];
        uint256 _price = bidPrice[tokenId];
        require(updatePrice(tokenId, _price));
        clearBid(tokenId);
        if (DEPOSIT) require(fungibleToken.transferFrom(this, _bidder, _price));
    }

    function updatePrice(uint256 tokenId, uint256 newPrice) internal returns (bool) {
        require(msg.sender == __owner[tokenId]);
        require(collectTaxesFrom(msg.sender, now));
        require(settleBuyerDeposit(msg.sender, tokenId, newPrice, now));
        return true;
    }

    function bidExpired(uint256 tokenId) public {
        require(now > bidExpiration[tokenId]);
        address _bidder = bidOwner[tokenId];
        uint256 _price = bidPrice[tokenId];
        require(_price <= price[tokenId]);
        
        clearBid(tokenId);
        require(fungibleToken.transferFrom(this, _bidder, _price));

        emit BidExpired(tokenId, _price, _bidder);
    }

    function claimBid(uint256 tokenId) public {
        require(now > bidExpiration[tokenId]);
        address _bidder = bidOwner[tokenId];
        uint256 _price = bidPrice[tokenId];
        require(_price > price[tokenId]);

        clearBid(tokenId);
        require(releaseTokenAndDeposit(tokenId));
        assignTokenTo(_bidder, tokenId, _price, now);
        emit Bought(tokenId, _price, _bidder);
    }

    function releaseTokenAndDeposit(uint256 tokenId) internal returns (bool) {
        require(settleBuyerDeposit(__owner[tokenId], tokenId, 0, now));
        releaseTokenFrom(__owner[tokenId], tokenId);
        return true;
    }

    function collectTaxesFrom(address person, uint256 currentDate) internal returns (bool) {
        if (!fungibleToken.transferFrom(person, this, balanceDue(person, currentDate))) {
            expropriateAllTokens(person);
            return false;
        }
        updateAllPaymentDates(person, currentDate);
        return true;
    }

    function expropriateAllTokens(address person) internal {
        while (_tokens[uint256(person)].length > 0) {
            popToken(person);
        }
    }

    function updateAllPaymentDates(address person, uint256 currentDate) internal {
        uint256 len = _tokens[uint256(person)].length;
        for (uint256 i = len-1; i >= 0; i--) {
            lastPayment[_tokens[uint256(person)][i]] = currentDate;
        }
    }

    function balanceDue(address person, uint256 currentDate) public view returns (uint256) {
        uint256 len = _tokens[uint256(person)].length;
        uint256 count = 0;
        for (uint256 i = 0; i < len; i++) {
            count += balanceDueForToken(_tokens[uint256(person)][i], currentDate);
        }
        return count;
    }

    function balanceDueNow(address person) public view returns (uint256) {
        return balanceDue(person, now);
    }

    function balanceDueForToken(uint256 tokenId, uint256 currentDate) public view returns (uint256) {
        return price[tokenId] * (currentDate - lastPayment[tokenId]) * TAX_NOMINATOR / TAX_DENOMINATOR;
    }
    function balanceDueForTokenNow(uint256 tokenId) public view returns (uint256) {
        return balanceDueForToken(tokenId, now);
    }

    function calculateGracePeriod(uint256 tokenId, uint256 currentDate) public view returns (uint256) {
        return mathmin(2 * YEAR, mathmax(DAY, (currentDate - startDate[tokenId]) / 7));
    }

    function calculateGracePeriodNow(uint256 tokenId) public view returns (uint256) {
        return calculateGracePeriod(tokenId, now);
    }

    function existsToken(uint256 tokenId) public view returns (bool) {
        return nftToken.ownerOf(tokenId) == address(this);
    }
    function settleBuyerDepositNow(address buyer, uint256 tokenId, uint256 newPrice) internal returns (bool) {
        return settleBuyerDeposit(buyer, tokenId, newPrice, now);
    }
    
    function settleBuyerDeposit(address buyer, uint256 tokenId, uint256 newPrice, uint256 currentDate) internal returns (bool) {
        if (!DEPOSIT) return true;
        if (__owner[tokenId] == buyer) {
            if (price[tokenId] < newPrice) {
                require(fungibleToken.transferFrom(buyer, this, price[tokenId] - newPrice));
            } else {
                require(currentDate > lockDecrease[tokenId]);
                lockDecrease[tokenId] = currentDate + LOCK_DECREASE_PERIOD;
                require(fungibleToken.transferFrom(this, buyer, newPrice - price[tokenId]));  
            }
        } else {
            require(fungibleToken.transferFrom(buyer, this, newPrice));
        }
        return true;
    }

    function assignTokenTo(address buyer, uint256 tokenId, uint256 newPrice, uint256 currentDate) internal {
        __owner[tokenId] = buyer;
        price[tokenId] = newPrice;
        startDate[tokenId] = currentDate;
        lastPayment[tokenId] = currentDate;
        
        _tokens[uint256(buyer)].push(tokenId);
    }

    function popToken(address buyer) internal returns (bool) {
        uint256 tokenId = _tokens[uint256(buyer)][_tokens[uint256(buyer)].length - 1];
        __owner[tokenId] = address(0);
        price[tokenId] = 0;
        startDate[tokenId] = 0;
        lastPayment[tokenId] = 0;

        _tokens[uint256(buyer)][_tokens[uint256(buyer)].length - 1] = 0;
        _tokens[uint256(buyer)].length -= 1;
        return true;
    }

    function releaseTokenFrom(address buyer, uint256 tokenId) internal returns (bool) {
        uint256 lastIndex = _tokens[uint256(buyer)].length - 1;
        uint256 tokenIndex = 0;
        for (tokenIndex = 0; tokenIndex < lastIndex; tokenIndex++) {
            if (_tokens[uint256(buyer)][tokenIndex] == tokenId) break;
        }
        require(tokenIndex <= lastIndex);

        __owner[tokenId] = address(0);
        price[tokenId] = 0;
        startDate[tokenId] = 0;
        lastPayment[tokenId] = 0;

        _tokens[uint256(buyer)][tokenIndex] = _tokens[uint256(buyer)][lastIndex];
        _tokens[uint256(buyer)][lastIndex] = 0;
        _tokens[uint256(buyer)].length -= 1;
        return true;
    }

    function mathmax(uint a, uint b) public pure returns (uint) {
        return a < b ? b : a;
    }
    function mathmin(uint a, uint b) public pure returns (uint) {
        return a < b ? a : b;
    }
}