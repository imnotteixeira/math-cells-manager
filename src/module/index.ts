import Container from "typedi";
import createGrammar from "../functions/grammar/bettermath"
import { BettermathGrammarParser } from "@tecido/bettermath";

export default () => {
    initGrammarParser();
}

export const GRAMMAR_PARSER = "GRAMMAR_PARSER";

const initGrammarParser = () => {
    const grammar = createGrammar();
    Container.set<BettermathGrammarParser>(GRAMMAR_PARSER, grammar) 
}