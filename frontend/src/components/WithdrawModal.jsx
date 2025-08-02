import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import numberFormat from "../../utils/numberFormat";
import "../assets/css/banks.css";
import BankSelect from "./BanksSelect";
import { BiSolidTrashAlt, BiSolidEdit } from "react-icons/bi";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { IoIosAddCircle } from "react-icons/io";
import { IoArrowBackCircle } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  addBankAccount,
  deleteBankAccount,
  getListBankAccount,
} from "../slices/withDrawSlice";

const MySwal = withReactContent(Swal);

const WithdrawModal = ({ show, onClose, currentBalance = 0 }) => {
  const { t } = useTranslation();
  const ns = "withdrawModal";
  const [step, setStep] = useState("list");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const dispatch = useDispatch();
  const { bankAccount } = useSelector((state) => state.withDraw);

  const {
    register: registerBank,
    handleSubmit: handleSubmitBank,
    control,
    reset: resetBankForm,
    formState: { errors: bankErrors },
    setValue,
  } = useForm({
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      bankBranch: "",
    },
  });

  const {
    control: controlWithdraw,
    handleSubmit: handleSubmitWithdraw,
    reset: resetWithdrawForm,
    formState: { errors: withdrawErrors },
    watch: watchWithdraw,
  } = useForm({
    defaultValues: {
      withdrawAmount: "",
    },
  });

  const watchedRaw = watchWithdraw("withdrawAmount") || "";
  const watchedAmount = parseFloat(watchedRaw || "0");

  useEffect(() => {
    if (step === "add") {
      resetBankForm();
    }
    if (step === "edit" && selectedAccount) {
      setValue("bankName", selectedAccount.bankName);
      setValue("accountNumber", selectedAccount.accountNumber);
      setValue("accountHolderName", selectedAccount.accountHolderName);
      setValue("bankBranch", selectedAccount.bankBranch);
    }
    if (step === "withdraw") {
      resetWithdrawForm();
    }
  }, [step, resetBankForm, resetWithdrawForm, setValue, selectedAccount]);

  const onSaveBankAccount = async (data) => {
    if (step === "edit" && selectedAccount) {
      MySwal.fire({
        icon: "success",
        title: t(`${ns}.bankAccountUpdated`),
      });
    } else {
      const newAccount = {
        id: Date.now(),
        bank_name: data.bankName,
        bank_account_number: data.accountNumber,
        bank_account_name: data.accountHolderName,
        beneficiary_bank: data.bankBranch,
      };

      try {
        await dispatch(addBankAccount(newAccount)).unwrap();
        await dispatch(getListBankAccount());
        MySwal.fire({
          icon: "success",
          title: t(`${ns}.bankAccountSaved`),
        });
      } catch (err) {
        MySwal.fire({
          icon: "error",
          title: err?.message || t(`${ns}.saveFailed`),
        });
        return;
      }
    }

    setStep("list");
    resetBankForm();
    setSelectedAccount(null);
  };

  const onConfirmWithdraw = (data) => {
    if (!selectedAccount) return;
    const amount = parseFloat(data.withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      MySwal.fire({
        icon: "error",
        title: t(`${ns}.amountGreaterThanZero`),
      });
      return;
    }
    if (amount > currentBalance) {
      MySwal.fire({
        icon: "error",
        title: t(`${ns}.insufficientBalance`),
      });
      return;
    }
    MySwal.fire({
      icon: "success",
      title: t(`${ns}.withdrawRequestProcessing`, {
        amount: numberFormat(amount),
      }),
    });
    setSelectedAccount(null);
    setStep("list");
    resetWithdrawForm();
    onClose();
  };

  const handleDeleteAccount = async (id) => {
    if (!id) return;

    try {
      // (Tuỳ UX) hỏi xác nhận trước khi xóa
      const result = await MySwal.fire({
        icon: "warning",
        title: t(`${ns}.confirmDelete`),
        showCancelButton: true,
        confirmButtonText: t(`${ns}.yesDelete`),
        cancelButtonText: t(`${ns}.cancel`),
        reverseButtons: true,
      });
      if (!result.isConfirmed) return;
      await dispatch(deleteBankAccount(id)).unwrap();
      await dispatch(getListBankAccount()).unwrap();

      MySwal.fire({
        icon: "success",
        title: t(`${ns}.accountDeleted1`),
      });
    } catch (error) {
      console.error("Delete bank account failed:", error);
      MySwal.fire({
        icon: "error",
        title: t(`${ns}.accountDeleteFail`),
      });
    }
  };

  const handleClose = () => {
    if (step === "add" || step === "withdraw" || step === "edit") {
      MySwal.fire({
        title: t(`${ns}.confirmCloseTitle`),
        text: t(`${ns}.confirmCloseText`),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t(`${ns}.yes`),
        cancelButtonText: t(`${ns}.no`),
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          setStep("list");
          resetBankForm();
          resetWithdrawForm();
          setSelectedAccount(null);
          onClose();
        }
      });
    } else {
      setStep("list");
      resetBankForm();
      resetWithdrawForm();
      setSelectedAccount(null);
      onClose();
    }
  };

  const formatDisplay = (raw) => {
    if (raw === "" || raw == null) return "";
    const cleaned = String(raw).replace(/,/g, "");
    const num = parseFloat(cleaned);
    if (isNaN(num)) return "";
    const fixed = Math.round(num * 100) / 100;
    return Number.isInteger(fixed)
      ? String(fixed)
      : String(fixed).replace(/\.?0+$/, "");
  };

  useEffect(() => {
    dispatch(getListBankAccount());
  }, [dispatch]);

  if (!show) return null;

  return (
    <div className="withdraw-modal-overlay">
      <div className="withdraw-modal-content">
        {/* Header */}
        <div className="withdraw-modal-header">
          <h3 className="withdraw-modal-title">
            {step === "add"
              ? t(`${ns}.addBankAccount`)
              : step === "edit"
              ? t(`${ns}.editBankAccount`)
              : t(`${ns}.withdrawMoney`)}
          </h3>
          <button
            onClick={handleClose}
            className="withdraw-modal-close-btn"
            aria-label={t(`${ns}.cancel`)}
          >
            ×
          </button>
        </div>

        {step === "list" && (
          <div>
            <div className="withdraw-balance-display">
              <p className="withdraw-balance-label">
                {t(`${ns}.currentBalance`)}
              </p>
              <p className="withdraw-balance-amount">
                {numberFormat(currentBalance)}
              </p>
            </div>
            {bankAccount.length > 0 ? (
              <>
                <h4 className="withdraw-accounts-title">
                  {t(`${ns}.bankAccounts`)}
                </h4>
                <div className="withdraw-accounts-container">
                  {bankAccount.map((account) => (
                    <div
                      key={account.withdraw_id}
                      className="withdraw-account-card"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="withdraw-account-card-content">
                        <div className="withdraw-account-info">
                          <p className="withdraw-account-bank-name">
                            {account.bank_name}
                          </p>
                          <p className="withdraw-account-number">
                            {account.bank_account_number}
                          </p>
                          <p className="withdraw-account-holder">
                            {account.bank_account_name}
                          </p>
                          {account.bankBranch && (
                            <p className="withdraw-account-branch">
                              {t(`${ns}.branch`)}: {account.beneficiary_bank}
                            </p>
                          )}
                        </div>
                        <div className="withdraw-account-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAccount(account);
                              setStep("edit");
                            }}
                            className="withdraw-account-edit-btn"
                            aria-label={t(`${ns}.editAccount`)}
                          >
                            <BiSolidEdit />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAccount(account.withdraw_id)
                            }
                            className="withdraw-account-delete-btn"
                            aria-label={t(`${ns}.accountDeleted`)}
                          >
                            <BiSolidTrashAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="withdraw-button-group">
                  <button
                    onClick={() => setStep("add")}
                    className="withdraw-btn withdraw-btn-secondary withdraw-btn-full"
                  >
                    <span style={{ marginRight: 5 }}>
                      <IoIosAddCircle />
                    </span>
                    {t(`${ns}.addNewAccount`)}
                  </button>
                  <button
                    onClick={() => setStep("withdraw")}
                    disabled={!selectedAccount}
                    className="withdraw-btn withdraw-btn-primary withdraw-btn-full"
                  >
                    <span style={{ marginRight: 5 }}>
                      <FaArrowRightToBracket />
                    </span>
                    {t(`${ns}.withdrawMoney`)}
                  </button>
                </div>
              </>
            ) : (
              <div className="withdraw-empty-state">
                <p className="withdraw-empty-text">
                  {t(`${ns}.noBankAccounts`)}
                </p>
                <button
                  onClick={() => setStep("add")}
                  className="withdraw-btn withdraw-btn-primary"
                >
                  {t(`${ns}.addBankAccount`)}
                </button>
              </div>
            )}
          </div>
        )}

        {(step === "add" || step === "edit") && (
          <form onSubmit={handleSubmitBank(onSaveBankAccount)}>
            <div className="withdraw-form-group">
              <label className="withdraw-form-label">
                {t(`${ns}.bankName`)}{" "}
                <span className="withdraw-required">*</span>
              </label>
              <Controller
                control={control}
                name="bankName"
                rules={{ required: t(`${ns}.selectBank`) }}
                render={({ field }) => (
                  <BankSelect
                    placeholder={t(`${ns}.selectBankPlaceholder`)}
                    value={field.value}
                    onChange={(bankObj) => field.onChange(bankObj.code)}
                  />
                )}
              />
              {bankErrors.bankName && (
                <p className="wm-validate-text">
                  {bankErrors.bankName.message}
                </p>
              )}
            </div>

            <div className="withdraw-form-group">
              <label className="withdraw-form-label">
                {t(`${ns}.accountNumber`)}{" "}
                <span className="withdraw-required">*</span>
              </label>
              <input
                {...registerBank("accountNumber", {
                  required: t(`${ns}.enterAccountNumber`),
                  pattern: {
                    value: /^[0-9]+$/,
                    message: t(`${ns}.accountNumberDigitsOnly`),
                  },
                  minLength: {
                    value: 6,
                    message: t(`${ns}.accountNumberTooShort`),
                  },
                })}
                type="text"
                placeholder={t(`${ns}.enterAccountNumberPlaceholder`)}
                className="withdraw-form-input"
              />
              {bankErrors.accountNumber && (
                <p className="wm-validate-text">
                  {bankErrors.accountNumber.message}
                </p>
              )}
            </div>

            <div className="withdraw-form-group">
              <label className="withdraw-form-label">
                {t(`${ns}.accountHolderName`)}{" "}
                <span className="withdraw-required">*</span>
              </label>
              <input
                {...registerBank("accountHolderName", {
                  required: t(`${ns}.enterAccountHolderName`),
                })}
                type="text"
                placeholder={t(`${ns}.enterAccountHolderNamePlaceholder`)}
                className="withdraw-form-input"
              />
              {bankErrors.accountHolderName && (
                <p className="wm-validate-text">
                  {bankErrors.accountHolderName.message}
                </p>
              )}
            </div>

            <div className="withdraw-form-group last">
              <label className="withdraw-form-label">{t(`${ns}.branch`)}</label>
              <input
                {...registerBank("bankBranch")}
                type="text"
                placeholder={t(`${ns}.enterBranchPlaceholder`)}
                className="withdraw-form-input"
              />
            </div>

            <div className="withdraw-button-group">
              <button
                type="button"
                onClick={() => setStep("list")}
                className="withdraw-btn withdraw-btn-secondary withdraw-btn-full"
              >
                {t(`${ns}.cancel`)}
              </button>
              <button
                type="submit"
                className="withdraw-btn withdraw-btn-primary withdraw-btn-full"
              >
                {step === "edit"
                  ? t(`${ns}.updateAccount`)
                  : t(`${ns}.saveAccount`)}
              </button>
            </div>
          </form>
        )}

        {/* Step: Withdraw Money */}
        {step === "withdraw" && selectedAccount && (
          <form onSubmit={handleSubmitWithdraw(onConfirmWithdraw)}>
            <div className="withdraw-selected-account">
              <h4 className="withdraw-selected-account-title">
                {t(`${ns}.recipientAccount`)}:{" "}
                <span className="ms-1">
                  {selectedAccount.accountHolderName}
                </span>
              </h4>
              <p className="withdraw-selected-account-bank">
                {t(`${ns}.bank`)}: {selectedAccount.bankName}
              </p>
              <p className="withdraw-selected-account-details">
                {t(`${ns}.accountNumber`)}: {selectedAccount.accountNumber}
              </p>
            </div>

            <div className="withdraw-form-group last">
              <label className="withdraw-form-label">
                {t(`${ns}.withdrawAmount`)}{" "}
                <span className="withdraw-required">*</span>
              </label>

              <Controller
                name="withdrawAmount"
                control={controlWithdraw}
                rules={{
                  required: t(`${ns}.enterWithdrawAmount`),
                  validate: {
                    positive: (v) =>
                      parseFloat(String(v).replace(/,/g, "")) > 0 ||
                      t(`${ns}.amountGreaterThanZero`),
                    maxBalance: (v) =>
                      parseFloat(String(v).replace(/,/g, "")) <=
                        currentBalance ||
                      t(`${ns}.invalidAmountExceedsBalance`, {
                        balance: numberFormat(currentBalance),
                      }),
                  },
                }}
                render={({ field }) => {
                  const displayValue = formatDisplay(field.value);
                  return (
                    <div
                      className="withdraw-input-wrapper"
                      style={{ position: "relative" }}
                    >
                      <input
                        {...field}
                        value={displayValue}
                        onChange={(e) => {
                          // allow digits and dot, strip commas
                          const raw = e.target.value.replace(/,/g, "");
                          // optionally restrict to pattern: number with up to 2 decimals
                          const sanitized = raw
                            .replace(/[^\d.]/g, "") // remove non-number/dot
                            .replace(/(\..*)\./g, "$1") // only one dot
                            .replace(
                              /^(\d+)\.(\d{0,2}).*$/,
                              (_, int, dec) => `${int}.${dec}`
                            );
                          field.onChange(sanitized);
                        }}
                        type="text"
                        placeholder={t(`${ns}.enterWithdrawAmountPlaceholder`)}
                        className="withdraw-form-input"
                        aria-label={t(`${ns}.withdrawAmount`)}
                      />
                      <span
                        onClick={() => {
                          resetWithdrawForm({
                            withdrawAmount: currentBalance.toString(),
                          });
                        }}
                        style={{
                          position: "absolute",
                          right: "15px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#2563eb",
                        }}
                      >
                        {t(`${ns}.maximum`)}
                      </span>
                    </div>
                  );
                }}
              />
              {withdrawErrors.withdrawAmount && (
                <p className="wm-validate-text">
                  {withdrawErrors.withdrawAmount.message}
                </p>
              )}
            </div>

            <div className="withdraw-button-group">
              <button
                type="button"
                onClick={() => setStep("list")}
                className="withdraw-btn withdraw-btn-secondary withdraw-btn-full"
              >
                <span style={{ marginRight: 5 }}>
                  <IoArrowBackCircle />
                </span>
                {t(`${ns}.back`)}
              </button>
              <button
                type="submit"
                className="withdraw-btn withdraw-btn-success withdraw-btn-full"
                disabled={isNaN(watchedAmount) || watchedAmount <= 0}
              >
                <span style={{ marginRight: 5 }}>
                  <FaArrowRightToBracket />
                </span>
                {t(`${ns}.confirmWithdraw`)}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;
