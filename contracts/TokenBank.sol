// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TokenBank {
    /// @dev トークンの名前
    string private _name;

    /// @dev トークンのシンボル
    string private _symbol;

    /// @dev トークンの総供給量
    uint256 constant _totalSupply = 1000;

    /// @dev トークンバンクがあづかっている総額
    uint256 private _bankTotalDeposit;

    /// @dev トークンバンクのオーナー
    address public owner;

    /// @dev アカウントアドレス毎のトークン残高
    mapping(address => uint256) private _balances;

    /// @dev トークンバンクが預かっているトークン残高
    mapping(address => uint256) private _tokenBankBalances;

    /// @dev トークン移転時のイベント
    event TokenTransfer(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    /// @dev トークン預け入れ時のイベント
    event TokenDeposit(
        address indexed from,
        uint256 amount
    );

    /// @dev トークン引き出し時のイベント
    event TokenWithdraw(
        address indexed from,
        uint256 amount
    );

    constructor (string memory name_, string memory symbol_) {
        _name   = name_;
        _symbol = symbol_;
        owner   = msg.sender;
        _balances[owner] = _totalSupply;
    }

    /// @dev トークンの名前を返す
    function name() public view returns (string memory) {
        return _name;
    }

    /// @dev トークンのシンボルを返す
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /// @dev トークンの総供給数を返す
    function totalSupply() public pure returns (uint256) {
        return _totalSupply;
    }

    /// @dev 指定アカウントアドレスのトークン残高を返す
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /// @dev トークンを移転
    function transfer(address to, uint256 amount) public {
        address from = msg.sender;
        _transfer(from, to, amount);
    }

    /// @dev 移転処理
    function _transfer(
        address from, 
        address to,
        uint256 amount
    ) internal {
        require(to != address(0), "Zero address cannot specified for 'to'");
        uint256 fromBalance = _balances[from];

        require(fromBalance >= amount, "Insufficient balance!");
        _balances[from] = fromBalance - amount;
        _balances[to]   += amount;
        emit TokenTransfer(from, to, amount);
    }

    /// @dev  TokenBankがあづかっている総額を返す
    function bankTotalDeposit() public view returns (uint256) {
        return _bankTotalDeposit;
    }

    /// @dev  TokenBankが預かっている指定のアカウントアドレスのToken数をかえす
    function bankBalanceOf(address account) public view returns (uint256) {
        return _tokenBankBalances[account];
    }

    /// @dev  Tokenを預ける
    function deposit(uint256 amount) public {
        address from = msg.sender;
        address to   = owner;

        _transfer(from, to, amount);

        _tokenBankBalances[from] += amount;
        _bankTotalDeposit += amount;

        emit TokenDeposit(from, amount);
    }
    
    /// @dev Tokenを引き出す
    function withdraw(uint256 amount) public {
        address to = msg.sender;
        address from = owner;
        uint256 toTokenBankBalance = _tokenBankBalances[to];
        require(toTokenBankBalance >= amount, "An amount greater than your tokenBank balance!");

        _transfer(from, to, amount);
        
        _tokenBankBalances[to] -= amount;
        _bankTotalDeposit -= amount;

        emit TokenWithdraw(to, amount);
    }
}
