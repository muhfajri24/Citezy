"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Textarea } from "@/components/ui";
import { getDemoResearchApi } from "@/lib/api/demo-client";
import { createSubmissionController, EXAMPLE_QUESTIONS, QUESTION_MIN_LENGTH, QUESTION_MAX_LENGTH, validateQuestion } from "@/lib/landing/research-submission";
import { ArrowIcon } from "./icons";

export function ResearchInput() {
    const router = useRouter();
    const [question, setQuestion] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const textarea = useRef<HTMLTextAreaElement>(null);
    const submission = useMemo(() => createSubmissionController(getDemoResearchApi, (path) => router.push(path)), [router]);
    useEffect(() => {
        let active = true;
        queueMicrotask(() => { if (active) { submission.reset(); setPending(false); } });
        return () => { active = false; };
    }, [submission]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending) return;
        const validation = validateQuestion(question);
        if (validation) {
            setError(validation);
            textarea.current?.focus();
            return;
        }
        setError(null);
        setPending(true);
        const result = await submission.submit(question);
        if (result.kind === "error") {
            setError(result.message);
            setPending(false);
            textarea.current?.focus();
        }
    }

    return <section className="research-section landing-container" aria-labelledby="research-heading">
        <div className="research-panel">
            <div className="research-heading"><span className="section-kicker">A GOOD QUESTION IS A GOOD START.</span><Badge className="demo-badge">Demo mode</Badge></div>
            <h2 id="research-heading">What do you want to understand?</h2>
            <form onSubmit={handleSubmit} noValidate aria-busy={pending}>
                <label htmlFor="research-question" className="sr-only">Your research question</label>
                <Textarea ref={textarea} id="research-question" name="question" value={question} disabled={pending}
                    className="research-textarea" placeholder="How does retrieval-augmented generation compare with fine-tuning?"
                    aria-invalid={Boolean(error)} aria-describedby={`question-help question-count${error ? " question-error" : ""}`}
                    onChange={(event) => { setQuestion(event.target.value); if (error) setError(null); }}
                    onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}
                />
                <div className="research-form-bottom"><p id="question-help">{QUESTION_MIN_LENGTH}–{QUESTION_MAX_LENGTH} characters. One focused question works best.</p><span id="question-count" className={question.trim().length > QUESTION_MAX_LENGTH ? "count-over" : ""}>{question.trim().length} / {QUESTION_MAX_LENGTH}</span></div>
                {error && <Alert id="question-error" role="alert" className="research-error">{error}</Alert>}
                <div className="research-submit-row"><p>No live search. No AI-generated findings.<br />Just a simulated request to explore the flow.</p><Button type="submit" disabled={pending} className="research-submit">{pending ? <><span className="loading-dot" aria-hidden="true" />Creating demo request...</> : <>Start researching <ArrowIcon className="small-icon" /></>}</Button></div>
                <span className="sr-only" role="status">{pending ? "Creating a simulated research request. Please wait." : ""}</span>
            </form>
            <div className="example-questions"><span>NEED A STARTING POINT?</span><div>{EXAMPLE_QUESTIONS.map((example) => <button key={example.label} type="button" disabled={pending} onClick={() => { setQuestion(example.question); setError(null); textarea.current?.focus(); }}>{example.label}<span aria-hidden="true">&#8599;</span></button>)}</div></div>
        </div>
    </section>;
}
