class User { //brugernes indhold defineres
    constructor(id, name, dateOfBirth, zipCode, email, password, description) { //CREATE
        this.id = id;
        this.name = name;
        this.dateOfBirth = dateOfBirth;
        this.zipCode = zipCode;
        this.email = email;
        this.password = password;
        this.description = description;
        this.likeIdList = [];
    };

    addLike(id) {
        if (!this.likeIdList.includes(id)) //hvis ikke id'et findes i brugerens like-array i forvejen, tilføjes det
           this.likeIdList.push(id);
    };

    removeLike(id) {
        this.likeIdList = this.likeIdList.filter((n) => {return n != id}); //der filtreres til en ny liste uden det pågældende id. Hvis id ikke findes, returneres samme liste.
    };
};

module.exports = User; //klassen eksporteres til brug i andre moduler