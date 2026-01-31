import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCountersApi, depositAtCounterApi } from '../api/client';
import '../styles/deposit.css';

const Deposit = ({ balance, onSubmit, isFrozen }) => {
  const [amount, setAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState(null); // 'bank', 'ewallet', 'qrcode'
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [counters, setCounters] = useState([]);
  const [loadingCounters, setLoadingCounters] = useState(false);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Mock data
  const linkedBanks = [
    { id: 1, name: 'Vietcombank', accountNumber: '****1234' },
    { id: 2, name: 'Techcombank', accountNumber: '****5678' },
    { id: 3, name: 'VPBank', accountNumber: '****9012' },
  ];

  const eWallets = [
    { id: 1, name: 'MoMo', accountNumber: '0901234567' },
    { id: 2, name: 'ZaloPay', accountNumber: '0909876543' },
    { id: 3, name: 'VNPay', accountNumber: '0912345678' },
  ];


  const currentBalance = balance || 0;
  const depositFee = amount && depositMethod
    ? depositMethod === 'bank' 
      ? 0 
      : depositMethod === 'ewallet'
        ? 15000 // 15,000 VND
        : 0
    : 0;
  const totalAmount = amount ? parseFloat(amount) : 0;
  const amountReceived = totalAmount - depositFee;
  const newBalance = currentBalance + amountReceived;

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const isValidForm = amount && parseFloat(amount) > 0 && depositMethod && 
    (depositMethod === 'bank' ? selectedCounter !== null : 
     depositMethod === 'qrcode' ? true : 
     selectedSource !== null);

  // Load danh sách quầy khi chọn phương thức nạp tiền ở quầy
  useEffect(() => {
    if (depositMethod === 'bank') {
      loadCounters();
    }
  }, [depositMethod]);

  const loadCounters = async () => {
    setLoadingCounters(true);
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await getCountersApi(token);
      if (response && response.data) {
        setCounters(response.data);
      }
    } catch (error) {
      console.error('Failed to load counters:', error);
    } finally {
      setLoadingCounters(false);
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const quickAmounts = [100000, 200000, 500000, 1000000];

  const getMethodName = () => {
    if (depositMethod === 'bank') return 'Nạp tiền ở quầy';
    if (depositMethod === 'ewallet') return 'Ví điện tử';
    if (depositMethod === 'qrcode') return 'QR Code';
    return '';
  };

  const getFeeDescription = () => {
    if (depositMethod === 'bank') return 'Miễn phí';
    if (depositMethod === 'ewallet') return '15,000 VND phí giao dịch';
    if (depositMethod === 'qrcode') return 'Miễn phí';
    return '';
  };

  const handleCopyQR = () => {
    navigator.clipboard.writeText('MB-12345678-JOHNDOE');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidForm || isFrozen) return;
    
    // Nếu là nạp tiền ở quầy, gọi API riêng
    if (depositMethod === 'bank' && selectedCounter) {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await depositAtCounterApi(token, parseFloat(amount), selectedCounter);
        if (response && response.data) {
          alert(`Yêu cầu nạp tiền đã được tạo. Mã giao dịch: ${response.data.transactionCode || 'N/A'}`);
          navigate('/dashboard');
        }
      } catch (error) {
        alert('Lỗi khi tạo yêu cầu nạp tiền: ' + error.message);
      }
      return;
    }
    
    // Các phương thức khác
    const success = onSubmit(parseFloat(amount));
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <div className="deposit-page">
        {/* Header */}
        <header className="deposit-header">
          <div className="deposit-header-content">
            <button 
              className="deposit-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Quay lại"
            >
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 style={{ marginLeft: '0.75rem', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
              Nạp Tiền
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="deposit-main">
          {/* Current Balance Card */}
          <div className="balance-card">
            <div className="balance-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                  <p className="balance-label">Số Dư Hiện Tại</p>
                  <p className="balance-amount">{formatCurrency(currentBalance)}</p>
                      </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.75rem', borderRadius: '0.75rem', backdropFilter: 'blur(4px)' }}>
                  <svg className="icon" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                      </div>
                    </div>
              <div className="balance-badges">
                <div className="balance-badge">
                  <svg className="icon-sm" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Bảo Mật</span>
                      </div>
                <div className="balance-badge">
                  <svg className="icon-sm" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Nạp Nhanh</span>
                </div>
              </div>
            </div>
                  </div>

          {/* Deposit Amount */}
          <div className="deposit-section">
            <label htmlFor="amount" className="deposit-label">
              Số Tiền Nạp
                      </label>
            <div className="amount-input-wrapper">
              <span className="amount-currency">₫</span>
                        <input
                type="text"
                          id="amount"
                          value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="amount-input"
                          disabled={isFrozen}
                        />
                    </div>

            {/* Quick Amount Buttons */}
            <div className="quick-amounts">
              {quickAmounts.map((quickAmount) => (
                          <button
                  key={quickAmount}
                            type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="quick-amount-btn"
                            disabled={isFrozen}
                          >
                  {quickAmount >= 1000000 ? `${quickAmount / 1000000}Tr` : `${quickAmount / 1000}k`}
                          </button>
                        ))}
                      </div>
                    </div>

          {/* Deposit Method */}
          <div className="deposit-section">
            <label className="deposit-label">
              Phương Thức Nạp Tiền
            </label>
            <div className="method-list">
              {/* Bank Transfer */}
              <button
                onClick={() => {
                  setDepositMethod('bank');
                  setSelectedSource(null);
                }}
                className={`method-btn ${depositMethod === 'bank' ? 'selected' : ''}`}
                disabled={isFrozen}
              >
                <div className="method-icon-wrapper">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="method-info">
                  <p className="method-name">Nạp tiền ở quầy</p>
                  <p className="method-fee">Miễn phí giao dịch</p>
                </div>
                <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* E-Wallet */}
              <button
                onClick={() => {
                  setDepositMethod('ewallet');
                  setSelectedSource(null);
                }}
                className={`method-btn ${depositMethod === 'ewallet' ? 'selected' : ''}`}
                disabled={isFrozen}
              >
                <div className="method-icon-wrapper">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="method-info">
                  <p className="method-name">Ví điện tử</p>
                  <p className="method-fee">Phí 15,000 VND</p>
                </div>
                <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

            </div>
          </div>

          {/* Counter Deposit Info */}
          {depositMethod === 'bank' && (
            <div className="deposit-section">
              <label className="deposit-label">
                Chọn Quầy Giao Dịch
              </label>
              {loadingCounters ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>Đang tải danh sách quầy...</p>
              ) : counters.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#dc2626', padding: '1rem' }}>Không có quầy giao dịch nào khả dụng</p>
              ) : (
                <div className="source-list">
                  {counters.map((counter) => (
                    <button
                      key={counter.counterId}
                      onClick={() => setSelectedCounter(counter.counterId)}
                      className={`source-btn ${selectedCounter === counter.counterId ? 'selected' : ''}`}
                      disabled={isFrozen}
                    >
                      <div className="source-icon" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)' }}>
                      </div>
                      <div className="source-info">
                        <p className="source-name">{counter.name}</p>
                        <p className="source-detail">{counter.address || 'Địa chỉ không có'}</p>
                      </div>
                      {selectedCounter === counter.counterId && (
                        <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedCounter && (
                <div className="qr-code-container" style={{ marginTop: '1rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '1rem', color: '#111827', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Thông tin cần thiết khi đến quầy
                    </p>
                  </div>
                  
                  <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500', marginBottom: '0.75rem' }}>
                      Thông tin cần thiết:
                    </p>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
                      <p style={{ marginBottom: '0.5rem' }}>• Số tài khoản của bạn</p>
                      <p style={{ marginBottom: '0.5rem' }}>• Số CMND/CCCD</p>
                      <p style={{ marginBottom: '0.5rem' }}>• Số tiền cần nạp</p>
                      <p>• Mã giao dịch (sẽ được cung cấp sau khi tạo yêu cầu)</p>
                    </div>
                  </div>

                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                      <svg style={{ width: '1rem', height: '1rem', color: '#d97706', marginTop: '0.125rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p style={{ fontSize: '0.8125rem', color: '#92400e', lineHeight: '1.5' }}>
                        Hệ thống sẽ tự động phân bổ nhân viên phù hợp. Sau khi nhân viên xác nhận đã nhận tiền, số tiền sẽ được cập nhật vào tài khoản ngay lập tức.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {depositMethod === 'ewallet' && (
            <div className="deposit-section">
              <label className="deposit-label">
                Chọn Ví Điện Tử
              </label>
              <div className="source-list">
                {eWallets.map((wallet) => (
                      <button
                    key={wallet.id}
                    onClick={() => setSelectedSource(wallet.id)}
                    className={`source-btn ${selectedSource === wallet.id ? 'selected' : ''}`}
                    disabled={isFrozen}
                  >
                    <div className="source-icon" style={{ background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)' }}>
                    </div>
                    <div className="source-info">
                      <p className="source-name">{wallet.name}</p>
                      <p className="source-detail">{wallet.accountNumber}</p>
                    </div>
                    {selectedSource === wallet.id && (
                      <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                      </button>
                ))}
              </div>
            </div>
          )}

          {depositMethod === 'qrcode' && (
            <div className="deposit-section">
              <div className="qr-code-container">
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div className="qr-placeholder">
                    <svg style={{ width: '6rem', height: '6rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Quét mã QR để nạp tiền
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Hoặc sao chép mã bên dưới
                  </p>
                </div>
                
                <div className="qr-code-text">
                  <code className="qr-code-value">MB-12345678-JOHNDOE</code>
                  <button
                    onClick={handleCopyQR}
                    className="copy-btn"
                    aria-label="Sao chép"
                  >
                    {copied ? (
                      <svg className="icon-sm" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {copied && (
                  <p style={{ fontSize: '0.75rem', color: '#16a34a', textAlign: 'center', marginTop: '0.5rem' }}>
                    Đã sao chép!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Note */}
          {depositMethod && (
            <div className="deposit-section">
              <label htmlFor="note" className="deposit-label">
                Ghi Chú (Tùy Chọn)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Thêm ghi chú cho giao dịch này"
                rows={3}
                maxLength={100}
                className="note-textarea"
                disabled={isFrozen}
              />
              <p className="note-counter">{note.length}/100</p>
            </div>
          )}

          {/* Transaction Summary */}
          {amount && parseFloat(amount) > 0 && depositMethod && (
            <div className="summary-card">
              <div className="summary-header">
                <h3 className="summary-title">Tóm Tắt Giao Dịch</h3>
                <div className="summary-badge">Xem lại</div>
              </div>
              
              <div style={{ paddingTop: '0.5rem' }}>
                <div className="summary-item">
                  <span className="summary-item-label">Số tiền nạp</span>
                  <span className="summary-item-value">{formatCurrency(parseFloat(amount))}</span>
                </div>
                
                <div className="summary-item">
                  <div className="summary-item-label tooltip">
                    <span>Phí giao dịch</span>
                    <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="tooltip-content">{getFeeDescription()}</div>
                  </div>
                  <span className="summary-item-value">-{formatCurrency(depositFee)}</span>
                </div>

                <div className="summary-item">
                  <span className="summary-item-label">Phương thức</span>
                  <span className="summary-item-value" style={{ fontSize: '0.875rem' }}>{getMethodName()}</span>
                </div>
                
                <div className="summary-item summary-divider">
                  <span className="summary-item-value">Số tiền nhận</span>
                  <span className="summary-item-value summary-received">{formatCurrency(amountReceived)}</span>
                </div>
                
                <div className="summary-new-balance">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="summary-new-balance-label">Số dư mới</span>
                    <span className="summary-new-balance-value">
                      {formatCurrency(newBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Fixed Bottom CTA */}
        <div className="deposit-footer">
          <div className="deposit-footer-content">
            <button
              onClick={handleSubmit}
              disabled={!isValidForm || isFrozen}
              className="submit-btn"
            >
              Xác Nhận Nạp Tiền
            </button>
            {isFrozen && (
              <p style={{ fontSize: '0.75rem', color: '#dc2626', textAlign: 'center', marginTop: '0.5rem' }}>
                Tài khoản đang bị khóa, không thể thực hiện giao dịch
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Deposit;
