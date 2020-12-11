import { Container, inject, injectable } from 'inversify'
import * as http from 'http'
import "reflect-metadata";

interface IControllerResponse{
    statusCode: number,
    response: string
}

interface IController {
    findAll: () => IControllerResponse
}

interface IDatabase {
    findAllQuotes: () => IQuote[]
}

interface IQuote {
    sumInsured: number
}

const container = new Container();

const TYPES = {
    IController: Symbol("IController"),
    IDatabase: Symbol("IDatabase")
}

@injectable()
class QuoteController implements IController {
    private database: IDatabase


    // I want an object that conforms to database
    constructor(
        @inject(TYPES.IDatabase) db: IDatabase
    ){
        this.database = db
    }

    findAll(): IControllerResponse {
       const quotes: IQuote[] = this.database.findAllQuotes()
        return {
            statusCode: quotes.length > 0 ? 200 : 404,
            response: JSON.stringify(quotes)
        }
    }
}

@injectable()
class HardcodedDatabase implements IDatabase { 
    findAllQuotes(): IQuote[] {
        return [
            {sumInsured: 5000},
            {sumInsured: 20000}
        ]
    }
}

container.bind<IController>(TYPES.IController).to(QuoteController)
container.bind<IDatabase>(TYPES.IDatabase).to(HardcodedDatabase)
const controller:IController = container.get<IController>(TYPES.IController)

const app: http.Server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
     if (request.url === "/quotes") {
         const result: IControllerResponse = controller.findAll();
         response.statusCode = result.statusCode
         response.end(result.response)
     }
})

app.listen(3000, () => console.log('listening on 3000'))