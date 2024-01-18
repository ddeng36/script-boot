import { Before, log, OnClass, After } from "../src/script-boot";
import FirstPage from "./first-page.class";

@OnClass
export default class AopTest {

    @Before(FirstPage, "index")
    public FirstIndex() {
        log("Before FirstPage index run, at AopTest FirstIndex.");
        log("AopTest FirstIndex run over." + this.getWordsFromAopTest());
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