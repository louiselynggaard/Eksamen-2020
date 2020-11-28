class User { //brugernes indhold defineres
    constructor(id, name, dateOfBirth, zipCode, email, password) { //CREATE
        this.id = id;
        this.name = name;
        this.dateOfBirth = dateOfBirth;
        this.zipCode = zipCode;
        this.email = email;
        this.password = password;
    };
};

module.exports = User; //klassen eksporteres til brug i andre moduler