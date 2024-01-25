import { log, Controller} from "../src/script-boot";
import { Before, After } from "../src/route.decorate";
import FirstPage from "./test-first-page.class";

@Controller
export default class AopTest {

    @Before(FirstPage, "index")
    public FirstIndex() {
        log("Before FirstPage index run, at AopTest FirstIndex, and", this.getWordsFromAopTest());
        return "FirstIndex";
    }

    public getWordsFromAopTest() {
        return "getWordsFromAopTest";
    }

    @Before(FirstPage, "getTestFromFirstPage")
    public testGetTestFromFirstPage() {
        log("AopTest testGetTestFromFirstPage run over.");
    }

    @After(FirstPage, "index")
    public testFirstIndexAfter(result) {
        log("AopTest testFirstIndexAfter run over, result: " + result);
    }

}