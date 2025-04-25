// src/components/Description.tsx
// 题目说明组件
import React, { useMemo } from 'react';
import { Box, Typography, Paper, Divider, useTheme, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface ProblemData {
    id: number;
    title: string;
    description: string; // Markdown 格式文本
    difficulty: string;
    is_premium: boolean;
    acceptance_rate: number;
    frequency: number;
    url: string;
    discuss_count: number;
    accepted: number;
    submissions: number;
    related_topics: string[];
    likes: number;
    dislikes: number;
    rating: number;
    similar_questions: string;
}

interface DescriptionProps {
    problem: ProblemData | null;
    loading: boolean;
    error: string;
}

const Description: React.FC<DescriptionProps> = ({ problem, loading, error }) => {
    const theme = useTheme();

    // 加载中的画面
    if (loading) {
        return (
            <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: theme.palette.background.paper, p: 2, alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6">Loading...</Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: theme.palette.background.paper, p: 2, alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Paper>
        );
    }

    if (!problem) {
        return (
            <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: theme.palette.background.paper, p: 2, alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="error">No problem information available</Typography>
            </Paper>
        );
    }

    // 拆分 intro、examples、constraints，进行一顿Markdown处理
    const { intro, examples, constraints } = useMemo(() => {
        const text = problem.description;
        const constraintIndex = text.search(/^Constraints:/m);
        const beforeConstraints = constraintIndex >= 0 ? text.slice(0, constraintIndex) : text;
        const cons = constraintIndex >= 0 ? text.slice(constraintIndex + 'Constraints:'.length) : '';

        const exampleRegex = /(Example \d+:)([\s\S]*?)(?=Example \d+:|$)/g;
        const exs: { title: string; content: string }[] = [];
        let m;
        while ((m = exampleRegex.exec(beforeConstraints))) {
            exs.push({ title: m[1].trim(), content: m[2].trim() });
        }

        const introText = exs.length > 0
            ? beforeConstraints.slice(0, beforeConstraints.indexOf(exs[0].title)).trim()
            : beforeConstraints.trim();

        return { intro: introText, examples: exs, constraints: cons.trim() };
    }, [problem.description]);

    const syntaxStyle = theme.palette.mode === 'dark' ? materialDark : materialLight;

    const markdownComponents = {
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match) {
                return (
                    <SyntaxHighlighter style={syntaxStyle} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                );
            }
            return (
                <Box
                    component="code"
                    sx={{ backgroundColor: theme.palette.action.selected, px: 0.5, borderRadius: 0.5, fontFamily: `'Fira Code', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace`, }}
                    {...props}
                >
                    {children}
                </Box>
            );
        },
        br({ ...props }: any) {
            return <Box component="br" {...props} />;
        },
    };

    return (
        <Paper elevation={3} sx={{height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: theme.palette.background.paper, p: 2 }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>

                {/* 标题与难度 */}
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {problem.title}
                </Typography>
                {/* 相关话题 标签 */}
                {problem.related_topics.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip key={problem.difficulty} label={problem.difficulty} size="small" color={"primary"}/>
                        {problem.related_topics.map(topic => (
                            <Chip key={topic} label={topic} size="small" />
                        ))}
                    </Box>
                )}
                <Divider sx={{ my: 2 }} />

                {/* 问题描述 */}
                {intro && (
                    <Box sx={{ mb: 2 }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                            {intro}
                        </ReactMarkdown>
                    </Box>
                )}

                {/* 示例块 */}
                {examples.map((ex, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                            {ex.title}
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, backgroundColor: theme.palette.action.hover }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                                {ex.content}
                            </ReactMarkdown>
                        </Paper>
                    </Box>
                ))}

                {/* 问题限制块 */}
                {constraints && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="error" gutterBottom>
                            Constraints
                        </Typography>
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                                {constraints}
                            </ReactMarkdown>
                    </Box>
                )}

                {/* 可折叠块：统计信息 & 相似题目 */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="bold">Problem Data</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {/* 统计信息 */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Typography variant="body2">Acceptance Rate: {problem.acceptance_rate}%</Typography>
                            <Typography variant="body2">Submissions: {problem.submissions}</Typography>
                            <Typography variant="body2">Accepted: {problem.accepted}</Typography>
                            <Typography variant="body2">Discussion Count: {problem.discuss_count}</Typography>
                            <Typography variant="body2">Likes: {problem.likes}</Typography>
                            <Typography variant="body2">Dislikes: {problem.dislikes}</Typography>
                            <Typography variant="body2">Rating: {problem.rating}</Typography>
                            <Typography variant="body2">Frequency: {problem.frequency}</Typography>
                        </Box>

                        {/* 相似题目 */}
                        {problem.similar_questions && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">Similar Questions:</Typography>
                                <Typography variant="body2">{problem.similar_questions}</Typography>
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>

            </Box>
        </Paper>
    );
};

export default Description;
