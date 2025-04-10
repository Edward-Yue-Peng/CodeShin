import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
const apiUrl = import.meta.env.VITE_API_BASE_URL;
interface ProblemData {
    id: number;
    title: string;
    description: string; // Markdown formatted problem description
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
    problemID?: number;
}

const Description: React.FC<DescriptionProps> = ({problemID}) => {
    const theme = useTheme();
    const [problem, setProblem] = useState<ProblemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!problemID) return;
        async function fetchProblem() {
            try {
                const response = await fetch(`${apiUrl}/api/problems/?id=${problemID}`);
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText);
                }
                const data = await response.json();
                setProblem(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch problem information');
            } finally {
                setLoading(false);
            }
        }
        fetchProblem();
    }, [problemID]);

    if (loading) {
        return (
            <Paper
                elevation={3}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.background.paper,
                    p: 2,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography variant="h6">Loading...</Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper
                elevation={3}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.background.paper,
                    p: 2,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Paper>
        );
    }

    if (!problem) {
        return (
            <Paper
                elevation={3}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.background.paper,
                    p: 2,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography variant="h6" color="error">
                    No problem information available
                </Typography>
            </Paper>
        );
    }

    // Custom Markdown code renderer
    const renderers = {
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <SyntaxHighlighter style={materialDark} language={match[1]} PreTag="div" {...props}>
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
    };

    return (
        <Paper
            elevation={3}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: theme.palette.background.paper,
                p: 2
            }}
        >
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {/* Problem Title and Basic Info */}
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {problem.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {problem.difficulty}
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Markdown Rendered Problem Description */}
                <Box sx={{ mb: 2 }}>
                    <ReactMarkdown components={renderers}>
                        {problem.description}
                    </ReactMarkdown>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Statistics Display */}
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

                {/* Related Topics */}
                {problem.related_topics && problem.related_topics.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Related Topics:
                        </Typography>
                        <Typography variant="body2">
                            {problem.related_topics.join(', ')}
                        </Typography>
                    </Box>
                )}

                {/* Similar Questions */}
                {problem.similar_questions && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Similar Questions:
                        </Typography>
                        <Typography variant="body2">{problem.similar_questions}</Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default Description;
