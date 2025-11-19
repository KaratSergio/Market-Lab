export class ProductEntity{
    constructor(
        public id: string | null,
        public name: string,
        public description: string,
        public price: number
    ){}

    setId(id: string | null){
        this.id = id;
    }
}