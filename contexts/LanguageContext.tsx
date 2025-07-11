import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language } from '../types';

const translationData = {
  en: {
    "common": {
        "loading": "Loading...",
        "loadingData": "Loading data...",
        "dataError": "Error loading data.",
        "save": "Save",
        "create": "Create",
        "cancel": "Cancel",
        "confirm": "Confirm"
    },
    "pageTitles": {
        "dashboard": "Dashboard",
        "stock": "Stock Management",
        "invoices": "Invoicing",
        "createInvoice": "Create Invoice",
        "editInvoice": "Edit Invoice",
        "customers": "Customer Management",
        "accounting": "Accounting",
        "settings": "Settings"
    },
    "sidebar": {
        "dashboard": "Dashboard",
        "stock": "Stock",
        "customers": "Customers",
        "invoices": "Invoices",
        "accounting": "Accounting",
        "settings": "Settings"
    },
    "status": {
        "draft": "Draft",
        "sent": "Sent",
        "paid": "Paid",
        "overdue": "Overdue",
        "cancelled": "Cancelled"
    },
    "conditions": {
        "grade_a": "Used - Grade A",
        "grade_b": "Used - Grade B",
        "for_parts": "For Parts"
    },
    "dashboard": {
        "totalRevenue": "Total Revenue",
        "totalExpenses": "Total Expenses",
        "netProfit": "Net Profit",
        "revenueVsExpensesChartTitle": "Revenue vs. Expenses (Last 6 months)",
        "chart": {
            "revenue": "Revenue",
            "expenses": "Expenses"
        },
        "notifications": {
            "loadError": "Failed to load dashboard data."
        }
    },
    "stock": {
        "searchPlaceholder": "Search for a part...",
        "addPartButton": "Add Part",
        "deleteConfirm": "Are you sure you want to delete this part? This action is irreversible.",
        "table": {
            "sku": "SKU Ref.",
            "name": "Name",
            "vehicle": "Source Vehicle",
            "condition": "Condition",
            "price": "Selling Price",
            "stock": "Stock",
            "actions": "Actions"
        },
        "modal": {
            "addTitle": "Add Part",
            "editTitle": "Edit Part"
        },
        "form": {
            "sku": "SKU Ref.",
            "name": "Part Name",
            "description": "Description",
            "vehicleMake": "Vehicle Make",
            "vehicleModel": "Vehicle Model",
            "vehicleYear": "Vehicle Year",
            "condition": "Condition",
            "location": "Location",
            "purchasePrice": "Purchase Price",
            "sellingPrice": "Selling Price",
            "quantity": "Quantity in Stock"
        },
        "notifications": {
            "loadError": "Failed to load parts.",
            "saveSuccess": "Part {sku} saved.",
            "deleteSuccess": "Part {sku} deleted.",
            "fillRequiredFields": "Please fill in the SKU, Name, and Selling Price fields.",
            "descGeneratedSuccess": "AI description generated.",
            "descGeneratedError": "Error generating description."
        }
    },
    "customers": {
        "title": "Customer Management",
        "addButton": "Add Customer",
        "deleteConfirmTitle": "Delete Customer",
        "deleteConfirmMessage": "Are you sure you want to delete {name}? This action is irreversible.",
        "table": {
            "name": "Name",
            "email": "Email",
            "phone": "Phone",
            "address": "Address",
            "actions": "Actions"
        },
        "modal": {
            "addTitle": "Add Customer",
            "editTitle": "Edit Customer"
        },
        "form": {
            "name": "Name",
            "email": "Email",
            "phone": "Phone",
            "address": "Address",
            "vat": "VAT Number"
        },
        "notifications": {
            "loadError": "Error loading customers.",
            "saveSuccess": "Customer {name} saved.",
            "deleteSuccess": "Customer deleted.",
            "deleteError": "Failed to delete customer.",
            "fillRequiredFields": "Please fill in the Name and Email fields."
        }
    },
    "invoices": {
        "createButton": "Create Invoice",
        "unknownCustomer": "Unknown Customer",
        "deleteConfirmTitle": "Delete Invoice",
        "deleteConfirmMessage": "Are you sure you want to delete this invoice? This action is irreversible.",
        "table": {
            "number": "Invoice No.",
            "customer": "Customer",
            "date": "Date",
            "total": "Total (incl. tax)",
            "status": "Status",
            "actions": "Actions"
        },
        "notifications": {
            "loadError": "Error loading invoices.",
            "settingsLoadError": "Application settings are not loaded.",
            "pdfSuccess": "PDF for invoice {number} generated.",
            "customerNotFoundError": "Customer not found for this invoice.",
            "deleteSuccess": "Invoice deleted successfully.",
            "deleteError": "Failed to delete invoice."
        }
    },
    "invoiceEditor": {
        "loading": "Loading editor...",
        "customerLabel": "Customer",
        "dateLabel": "Invoice Date",
        "searchPlaceholder": "Search for a part to add...",
        "stockLabel": "Stock",
        "totalHT": "Subtotal",
        "vatAmount": "VAT ({rate}%)",
        "totalTTC": "GRAND TOTAL",
        "table": {
            "description": "Description",
            "qty": "Qty",
            "unitPrice": "Unit Price",
            "totalHT": "Total"
        },
        "notifications": {
            "notFound": "Invoice not found.",
            "loadError": "Error loading the invoice editor.",
            "itemExists": "This part is already in the invoice.",
            "noItemsError": "An invoice cannot be finalized with no items.",
            "saveSuccess": "Invoice {number} saved.",
            "saveError": "Failed to save the invoice. Please try again."
        }
    },
    "accounting": {
        "title": "Accounting",
        "expenseManagement": "Expense Management",
        "addExpense": "Add an Expense",
        "expenseDescriptionPlaceholder": "Description (e.g., Rent, Wreck purchase...)",
        "expenseAmountPlaceholder": "Amount",
        "addExpenseButton": "Add Expense",
        "allExpenses": "All Expenses",
        "reports": "Reports",
        "bestSellingParts": "Best-Selling Parts",
        "sold": "{count} sold",
        "deleteExpenseConfirm": "Are you sure you want to delete this expense?",
        "table": {
            "description": "Description",
            "date": "Date",
            "amount": "Amount",
            "actions": "Actions"
        },
        "notifications": {
            "loadError": "Failed to load accounting data.",
            "fillFieldsError": "Please fill all fields correctly.",
            "expenseAddedSuccess": "Expense added successfully.",
            "expenseDeletedSuccess": "Expense deleted successfully.",
            "expenseDeletedError": "Error deleting expense."
        }
    },
    "settings": {
        "loading": "Loading settings...",
        "saveButton": "Save Settings",
        "companyInfo": {
            "title": "Company Information",
            "name": "Company Name",
            "phone": "Phone",
            "address": "Address",
            "email": "Email",
            "vatId": "VAT / Tax ID"
        },
        "financial": {
            "title": "Financial Settings",
            "vatRate": "VAT Rate (%)",
            "currencySymbol": "Currency Symbol",
            "currencyCode": "Currency Code (ISO)"
        },
        "notifications": {
            "saveSuccess": "Settings saved successfully.",
            "saveError": "Error saving settings."
        }
    },
    "gemini": {
        "apiKeyError": "API Key not configured.",
        "generationError": "Error generating description."
    },
    "pdf": {
        "invoiceTitle": "INVOICE",
        "phoneLabel": "Phone",
        "emailLabel": "Email",
        "vatIdLabel": "Tax ID",
        "invoiceNumberLabel": "Invoice No.",
        "invoiceDateLabel": "Invoice Date",
        "dueDateLabel": "Due Date",
        "billToLabel": "BILL TO",
        "customerVatLabel": "Customer VAT",
        "table": {
            "ref": "REF.",
            "designation": "DESCRIPTION",
            "unitPrice": "UNIT PRICE",
            "qty": "QTY",
            "totalHT": "TOTAL"
        },
        "totalHT": "Subtotal",
        "vatAmount": "VAT Amount",
        "totalTTC": "TOTAL (incl. tax)",
        "footer": "Payment terms: Payment upon receipt of invoice. Thank you for your business.",
        "invoiceFileName": "Invoice"
    }
  },
  fr: {
    "common": {
        "loading": "Chargement...",
        "loadingData": "Chargement des données...",
        "dataError": "Erreur lors du chargement des données.",
        "save": "Sauvegarder",
        "create": "Créer",
        "cancel": "Annuler",
        "confirm": "Confirmer"
    },
    "pageTitles": {
        "dashboard": "Tableau de Bord",
        "stock": "Gestion de Stock",
        "invoices": "Facturation",
        "createInvoice": "Créer une Facture",
        "editInvoice": "Modifier la Facture",
        "customers": "Gestion des Clients",
        "accounting": "Comptabilité",
        "settings": "Paramètres"
    },
    "sidebar": {
        "dashboard": "Tableau de Bord",
        "stock": "Stock",
        "customers": "Clients",
        "invoices": "Factures",
        "accounting": "Comptabilité",
        "settings": "Paramètres"
    },
    "status": {
        "draft": "Brouillon",
        "sent": "Envoyée",
        "paid": "Payée",
        "overdue": "En retard",
        "cancelled": "Annulée"
    },
    "conditions": {
        "grade_a": "Occasion - Grade A",
        "grade_b": "Occasion - Grade B",
        "for_parts": "Pour pièces"
    },
    "dashboard": {
        "totalRevenue": "Revenu Total",
        "totalExpenses": "Dépenses Totales",
        "netProfit": "Bénéfice Net",
        "revenueVsExpensesChartTitle": "Revenus vs Dépenses (6 derniers mois)",
        "chart": {
            "revenue": "Revenus",
            "expenses": "Dépenses"
        },
        "notifications": {
            "loadError": "Erreur lors du chargement des données du tableau de bord."
        }
    },
    "stock": {
        "searchPlaceholder": "Rechercher une pièce...",
        "addPartButton": "Ajouter une pièce",
        "deleteConfirm": "Êtes-vous sûr de vouloir supprimer cette pièce ? Cette action est irréversible.",
        "table": {
            "sku": "Réf. SKU",
            "name": "Nom",
            "vehicle": "Véhicule Source",
            "condition": "Condition",
            "price": "Prix Vente",
            "stock": "Stock",
            "actions": "Actions"
        },
        "modal": {
            "addTitle": "Ajouter une Pièce",
            "editTitle": "Modifier la Pièce"
        },
        "form": {
            "sku": "Réf. SKU",
            "name": "Nom de la pièce",
            "description": "Description",
            "vehicleMake": "Marque Véhicule",
            "vehicleModel": "Modèle Véhicule",
            "vehicleYear": "Année Véhicule",
            "condition": "Condition",
            "location": "Emplacement",
            "purchasePrice": "Prix Achat",
            "sellingPrice": "Prix Vente",
            "quantity": "Quantité en Stock"
        },
        "notifications": {
            "loadError": "Erreur lors du chargement des pièces.",
            "saveSuccess": "Pièce {sku} sauvegardée.",
            "deleteSuccess": "Pièce {sku} supprimée.",
            "fillRequiredFields": "Veuillez remplir les champs Réf. SKU, Nom et Prix de Vente.",
            "descGeneratedSuccess": "Description générée par IA.",
            "descGeneratedError": "Erreur lors de la génération de la description."
        }
    },
    "customers": {
        "title": "Gestion des Clients",
        "addButton": "Ajouter un client",
        "deleteConfirmTitle": "Supprimer le Client",
        "deleteConfirmMessage": "Êtes-vous sûr de vouloir supprimer le client {name} ? Cette action est irréversible.",
        "table": {
            "name": "Nom",
            "email": "Email",
            "phone": "Téléphone",
            "address": "Adresse",
            "actions": "Actions"
        },
        "modal": {
            "addTitle": "Ajouter un Client",
            "editTitle": "Modifier le Client"
        },
        "form": {
            "name": "Nom",
            "email": "Email",
            "phone": "Téléphone",
            "address": "Adresse",
            "vat": "Matricule Fiscal (TVA)"
        },
        "notifications": {
            "loadError": "Erreur lors du chargement des clients.",
            "saveSuccess": "Client {name} sauvegardé.",
            "deleteSuccess": "Client supprimé.",
            "deleteError": "Échec de la suppression du client.",
            "fillRequiredFields": "Veuillez remplir les champs Nom et Email."
        }
    },
    "invoices": {
        "createButton": "Créer une facture",
        "unknownCustomer": "Client inconnu",
        "deleteConfirmTitle": "Supprimer la Facture",
        "deleteConfirmMessage": "Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.",
        "table": {
            "number": "N° Facture",
            "customer": "Client",
            "date": "Date",
            "total": "Total TTC",
            "status": "Statut",
            "actions": "Actions"
        },
        "notifications": {
            "loadError": "Erreur lors du chargement des factures.",
            "settingsLoadError": "Les paramètres de l'application ne sont pas chargés.",
            "pdfSuccess": "PDF pour la facture {number} généré.",
            "customerNotFoundError": "Client non trouvé pour cette facture.",
            "deleteSuccess": "Facture supprimée avec succès.",
            "deleteError": "Échec de la suppression de la facture."
        }
    },
    "invoiceEditor": {
        "loading": "Chargement de l'éditeur...",
        "customerLabel": "Client",
        "dateLabel": "Date de la facture",
        "searchPlaceholder": "Rechercher une pièce à ajouter...",
        "stockLabel": "Stock",
        "totalHT": "Total HT",
        "vatAmount": "TVA ({rate}%)",
        "totalTTC": "TOTAL TTC",
        "table": {
            "description": "Description",
            "qty": "Qté",
            "unitPrice": "P.U. HT",
            "totalHT": "Total HT"
        },
        "notifications": {
            "notFound": "Facture non trouvée.",
            "loadError": "Erreur lors du chargement de l'éditeur de facture.",
            "itemExists": "Cette pièce est déjà dans la facture.",
            "noItemsError": "Une facture ne peut pas être finalisée sans articles.",
            "saveSuccess": "Facture {number} sauvegardée.",
            "saveError": "Échec de la sauvegarde de la facture. Veuillez réessayer."
        }
    },
    "accounting": {
        "title": "Comptabilité",
        "expenseManagement": "Gestion des Dépenses",
        "addExpense": "Ajouter une Dépense",
        "expenseDescriptionPlaceholder": "Description (ex: Loyer, Achat épave...)",
        "expenseAmountPlaceholder": "Montant",
        "addExpenseButton": "Ajouter la dépense",
        "allExpenses": "Toutes les Dépenses",
        "reports": "Rapports",
        "bestSellingParts": "Pièces les plus vendues",
        "sold": "{count} vendues",
        "deleteExpenseConfirm": "Êtes-vous sûr de vouloir supprimer cette dépense ?",
        "table": {
            "description": "Description",
            "date": "Date",
            "amount": "Montant",
            "actions": "Actions"
        },
        "notifications": {
            "loadError": "Erreur de chargement des données comptables.",
            "fillFieldsError": "Veuillez remplir correctement tous les champs.",
            "expenseAddedSuccess": "Dépense ajoutée avec succès.",
            "expenseDeletedSuccess": "Dépense supprimée avec succès.",
            "expenseDeletedError": "Erreur lors de la suppression de la dépense."
        }
    },
    "settings": {
        "loading": "Chargement des paramètres...",
        "saveButton": "Sauvegarder les Paramètres",
        "companyInfo": {
            "title": "Informations sur l'entreprise",
            "name": "Nom de l'entreprise",
            "phone": "Téléphone",
            "address": "Adresse",
            "email": "Email",
            "vatId": "Matricule Fiscal"
        },
        "financial": {
            "title": "Paramètres Financiers",
            "vatRate": "Taux de TVA (%)",
            "currencySymbol": "Symbole Monétaire",
            "currencyCode": "Code Monétaire (ISO)"
        },
        "notifications": {
            "saveSuccess": "Paramètres sauvegardés avec succès.",
            "saveError": "Erreur lors de la sauvegarde des paramètres."
        }
    },
    "gemini": {
        "apiKeyError": "Clé API non configurée.",
        "generationError": "Erreur lors de la génération de la description."
    },
    "pdf": {
        "invoiceTitle": "FACTURE",
        "phoneLabel": "Tél",
        "emailLabel": "Email",
        "vatIdLabel": "Matricule Fiscal",
        "invoiceNumberLabel": "Facture N°",
        "invoiceDateLabel": "Date de Facture",
        "dueDateLabel": "Date d'échéance",
        "billToLabel": "FACTURÉ À",
        "customerVatLabel": "N° TVA",
        "table": {
            "ref": "RÉF.",
            "designation": "DÉSIGNATION",
            "unitPrice": "P.U. HT",
            "qty": "QTÉ",
            "totalHT": "MONTANT HT"
        },
        "totalHT": "Total HT",
        "vatAmount": "Montant TVA",
        "totalTTC": "TOTAL TTC",
        "footer": "Conditions de paiement: Paiement à réception de facture. Merci de votre confiance.",
        "invoiceFileName": "Facture"
    }
  },
  ar: {
    "common": {
        "loading": "جاري التحميل...",
        "loadingData": "جاري تحميل البيانات...",
        "dataError": "خطأ في تحميل البيانات.",
        "save": "حفظ",
        "create": "إنشاء",
        "cancel": "إلغاء",
        "confirm": "تأكيد"
    },
    "pageTitles": {
        "dashboard": "لوحة التحكم",
        "stock": "إدارة المخزون",
        "invoices": "الفوترة",
        "createInvoice": "إنشاء فاتورة",
        "editInvoice": "تعديل الفاتورة",
        "customers": "إدارة العملاء",
        "accounting": "المحاسبة",
        "settings": "الإعدادات"
    },
    "sidebar": {
        "dashboard": "لوحة التحكم",
        "stock": "المخزون",
        "customers": "العملاء",
        "invoices": "الفواتير",
        "accounting": "المحاسبة",
        "settings": "الإعدادات"
    },
    "status": {
        "draft": "مسودة",
        "sent": "مرسلة",
        "paid": "مدفوعة",
        "overdue": "متأخرة",
        "cancelled": "ملغاة"
    },
    "conditions": {
        "grade_a": "مستعمل - درجة أ",
        "grade_b": "مستعمل - درجة ب",
        "for_parts": "قطع غيار"
    },
    "dashboard": {
        "totalRevenue": "إجمالي الدخل",
        "totalExpenses": "إجمالي المصاريف",
        "netProfit": "صافي الربح",
        "revenueVsExpensesChartTitle": "الدخل مقابل المصاريف (آخر 6 أشهر)",
        "chart": {
            "revenue": "الدخل",
            "expenses": "المصاريف"
        },
        "notifications": {
            "loadError": "فشل تحميل بيانات لوحة التحكم."
        }
    },
    "stock": {
        "searchPlaceholder": "ابحث عن قطعة...",
        "addPartButton": "إضافة قطعة",
        "deleteConfirm": "هل أنت متأكد من حذف هذه القطعة؟ هذا الإجراء لا يمكن التراجع عنه.",
        "table": {
            "sku": "المرجع",
            "name": "الاسم",
            "vehicle": "السيارة المصدر",
            "condition": "الحالة",
            "price": "سعر البيع",
            "stock": "المخزون",
            "actions": "إجراءات"
        },
        "modal": {
            "addTitle": "إضافة قطعة",
            "editTitle": "تعديل القطعة"
        },
        "form": {
            "sku": "مرجع SKU",
            "name": "اسم القطعة",
            "description": "الوصف",
            "vehicleMake": "ماركة السيارة",
            "vehicleModel": "طراز السيارة",
            "vehicleYear": "سنة الصنع",
            "condition": "الحالة",
            "location": "الموقع",
            "purchasePrice": "سعر الشراء",
            "sellingPrice": "سعر البيع",
            "quantity": "الكمية في المخزون"
        },
        "notifications": {
            "loadError": "فشل تحميل القطع.",
            "saveSuccess": "تم حفظ القطعة {sku}.",
            "deleteSuccess": "تم حذف القطعة {sku}.",
            "fillRequiredFields": "يرجى ملء حقول المرجع والاسم وسعر البيع.",
            "descGeneratedSuccess": "تم إنشاء الوصف بواسطة الذكاء الاصطناعي.",
            "descGeneratedError": "خطأ في إنشاء الوصف."
        }
    },
    "customers": {
        "title": "إدارة العملاء",
        "addButton": "إضافة عميل",
        "deleteConfirmTitle": "حذف العميل",
        "deleteConfirmMessage": "هل أنت متأكد من حذف العميل {name}؟ هذا الإجراء لا يمكن التراجع عنه.",
        "table": {
            "name": "الاسم",
            "email": "البريد الإلكتروني",
            "phone": "الهاتف",
            "address": "العنوان",
            "actions": "إجراءات"
        },
        "modal": {
            "addTitle": "إضافة عميل",
            "editTitle": "تعديل العميل"
        },
        "form": {
            "name": "الاسم",
            "email": "البريد الإلكتروني",
            "phone": "الهاتف",
            "address": "العنوان",
            "vat": "الرقم الضريبي"
        },
        "notifications": {
            "loadError": "خطأ في تحميل العملاء.",
            "saveSuccess": "تم حفظ العميل {name}.",
            "deleteSuccess": "تم حذف العميل.",
            "deleteError": "فشل حذف العميل.",
            "fillRequiredFields": "يرجى ملء حقلي الاسم والبريد الإلكتروني."
        }
    },
    "invoices": {
        "createButton": "إنشاء فاتورة",
        "unknownCustomer": "عميل غير معروف",
        "deleteConfirmTitle": "حذف الفاتورة",
        "deleteConfirmMessage": "هل أنت متأكد من حذف هذه الفاتورة؟ هذا الإجراء لا يمكن التراجع عنه.",
        "table": {
            "number": "رقم الفاتورة",
            "customer": "العميل",
            "date": "التاريخ",
            "total": "الإجمالي (شامل الضريبة)",
            "status": "الحالة",
            "actions": "إجراءات"
        },
        "notifications": {
            "loadError": "خطأ في تحميل الفواتير.",
            "settingsLoadError": "إعدادات التطبيق غير محملة.",
            "pdfSuccess": "تم إنشاء PDF للفاتورة {number}.",
            "customerNotFoundError": "لم يتم العثور على العميل لهذه الفاتورة.",
            "deleteSuccess": "تم حذف الفاتورة بنجاح.",
            "deleteError": "فشل حذف الفاتورة."
        }
    },
    "invoiceEditor": {
        "loading": "جاري تحميل المحرر...",
        "customerLabel": "العميل",
        "dateLabel": "تاريخ الفاتورة",
        "searchPlaceholder": "ابحث عن قطعة لإضافتها...",
        "stockLabel": "المخزون",
        "totalHT": "المجموع (قبل الضريبة)",
        "vatAmount": "الضريبة ({rate}%)",
        "totalTTC": "المجموع الكلي",
        "table": {
            "description": "الوصف",
            "qty": "الكمية",
            "unitPrice": "سعر الوحدة",
            "totalHT": "المجموع"
        },
        "notifications": {
            "notFound": "الفاتورة غير موجودة.",
            "loadError": "خطأ في تحميل محرر الفاتورة.",
            "itemExists": "هذه القطعة موجودة بالفعل في الفاتورة.",
            "noItemsError": "لا يمكن إنهاء فاتورة فارغة.",
            "saveSuccess": "تم حفظ الفاتورة {number}.",
            "saveError": "فشل حفظ الفاتورة. يرجى المحاولة مرة أخرى."
        }
    },
    "accounting": {
        "title": "المحاسبة",
        "expenseManagement": "إدارة المصاريف",
        "addExpense": "إضافة مصروف",
        "expenseDescriptionPlaceholder": "الوصف (مثال: إيجار، شراء سيارة...)",
        "expenseAmountPlaceholder": "المبلغ",
        "addExpenseButton": "إضافة المصروف",
        "allExpenses": "كافة المصاريف",
        "reports": "التقارير",
        "bestSellingParts": "القطع الأكثر مبيعاً",
        "sold": "تم بيع {count}",
        "deleteExpenseConfirm": "هل أنت متأكد من حذف هذا المصروف؟",
        "table": {
            "description": "الوصف",
            "date": "التاريخ",
            "amount": "المبلغ",
            "actions": "إجراءات"
        },
        "notifications": {
            "loadError": "فشل تحميل البيانات المحاسبية.",
            "fillFieldsError": "يرجى ملء جميع الحقول بشكل صحيح.",
            "expenseAddedSuccess": "تمت إضافة المصروف بنجاح.",
            "expenseDeletedSuccess": "تم حذف المصروف بنجاح.",
            "expenseDeletedError": "خطأ في حذف المصروف."
        }
    },
    "settings": {
        "loading": "جاري تحميل الإعدادات...",
        "saveButton": "حفظ الإعدادات",
        "companyInfo": {
            "title": "معلومات الشركة",
            "name": "اسم الشركة",
            "phone": "الهاتف",
            "address": "العنوان",
            "email": "البريد الإلكتروني",
            "vatId": "المعرف الجبائي"
        },
        "financial": {
            "title": "الإعدادات المالية",
            "vatRate": "نسبة الضريبة (%)",
            "currencySymbol": "رمز العملة",
            "currencyCode": "رمز العملة (ISO)"
        },
        "notifications": {
            "saveSuccess": "تم حفظ الإعدادات بنجاح.",
            "saveError": "خطأ في حفظ الإعدادات."
        }
    },
    "gemini": {
        "apiKeyError": "مفتاح API غير مهيأ.",
        "generationError": "خطأ أثناء إنشاء الوصف."
    },
    "pdf": {
        "invoiceTitle": "فاتورة",
        "phoneLabel": "الهاتف",
        "emailLabel": "البريد الإلكتروني",
        "vatIdLabel": "المعرف الجبائي",
        "invoiceNumberLabel": "رقم الفاتورة",
        "invoiceDateLabel": "تاريخ الفاتورة",
        "dueDateLabel": "تاريخ الاستحقاق",
        "billToLabel": "فوترة إلى",
        "customerVatLabel": "الرقم الضريبي للعميل",
        "table": {
            "ref": "المرجع",
            "designation": "الوصف",
            "unitPrice": "سعر الوحدة",
            "qty": "الكمية",
            "totalHT": "المجموع"
        },
        "totalHT": "المجموع (قبل الضريبة)",
        "vatAmount": "قيمة الضريبة",
        "totalTTC": "المجموع الكلي",
        "footer": "شروط الدفع: الدفع عند استلام الفاتورة. شكرا لثقتكم.",
        "invoiceFileName": "فاتورة"
    }
  }
};


interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || 'fr'
  );

  const translations = (translationData as Record<Language, any>)[language];

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string, options: any = {}) => {
    if (!translations) {
      return key;
    }
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }

    if (typeof result === 'string') {
      return result.replace(/\{(\w+)\}/g, (placeholder, placeholderKey) => {
        return options[placeholderKey] !== undefined ? options[placeholderKey] : placeholder;
      });
    }
    
    return key;
  }, [language, translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
