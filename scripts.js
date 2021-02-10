
let operation = 0; // número negativo para saídas; número positivo para entradas.


const Modal = {
    open(value){
        // Abrir modal.
        // Adicionar a classe active ao modal.
        document.querySelector('.modal-overlay').classList.add('active');
        if(value > 0){
            operation = 1;
        }if(value < 0){
            operation = -1;
        }
    },
    close(operation){
        //Fechar Modal.
        //Remover a classe active do modal.
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction);

        App.reload();

    },

    remove(index){
        Transaction.all.splice(index, 1);
        App.reload();
    },

    incomes(){
        let income = 0;
        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        })

        return income
    },

    expenses(){
        let expense = 0;
        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })

        return expense
    },

    total(){
        return Transaction.incomes() + Transaction.expenses();
    }

}

const DOM = {

    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        // console.log(transaction);
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        DOM.transactionContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);

        const html = 
        `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
        `

        return html
    },

    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        DOM.transactionContainer.innerHTML = "";
    }
}


const Utils = {
    formatDate(date){
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatAmount(value){
        if(operation > 0){
            value = Number(value) * 100;
        }if(operation < 0){
            value = -1 * (Number(value) * 100);
        }
        return value;
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "&nbsp;&nbsp;";

        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return `${signal} ${value}`;

    }
}

const Form = {
    desciption: document.querySelector(`input#description`),
    amount: document.querySelector(`input#amount`),
    date: document.querySelector(`input#date`),

    getValues(){
        return {
            description: Form.desciption.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    saveTransaction(transaction){
        Transaction.add(transaction);
    },

    clearFields(){
        Form.desciption.value = ""
        Form.date.value = ""
        Form.amount.value = ""
    },

    validateFields(){
        const { description, amount, date } = Form.getValues();
        if(description.trim() === "" || amount.trim() === "" || date === ""){
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return{
            description,
            amount,
            date
        }
    },

    submit(event){
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Form.saveTransaction(transaction);
            Form.clearFields();
            Modal.close();
        } catch (error) {
            window.alert(error.message)
        }



    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        })
        
        DOM.updateBalance();

        Storage.set(Transaction.all);
    },

    reload(){
        DOM.clearTransactions();
        App.init();
    }
}

App.init()

