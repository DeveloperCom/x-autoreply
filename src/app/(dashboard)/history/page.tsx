'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Pencil,
  ChevronUp,
  Check,
  X,
  Copy,
  MessageCircle,
  Repeat,
  Heart,
  Share,
  BadgeCheck
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type Post = {
  id: string;
  content: string;
  likes: number;
  retweets: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  postedAt: string;
};

type Category = {
  id: string;
  name: string;
};

export default function PostHistory() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [xUsername, setXUsername] = useState('creator');

  // Dynamic Categories states
  const [categories, setCategories] = useState<Category[]>([]);


  // Collapse state for Add form
  const [showAddForm, setShowAddForm] = useState(false);

  // Helper to get local date in YYYY-MM-DD
  const getLocalDateString = () => {
    return new Date().toLocaleDateString('en-CA');
  };

  // Add form states
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostLikes, setNewPostLikes] = useState(0);
  const [newPostRetweets, setNewPostRetweets] = useState(0);
  const [newPostCategory, setNewPostCategory] = useState('');
  const [newPostDate, setNewPostDate] = useState(getLocalDateString());
  const [isAddingPost, setIsAddingPost] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editLikes, setEditLikes] = useState(0);
  const [editRetweets, setEditRetweets] = useState(0);
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Export Date Range states
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [copiedRange, setCopiedRange] = useState(false);

  // Delete states
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isDeletingPostState, setIsDeletingPostState] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchSettings();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.xUsername) {
          setXUsername(data.xUsername);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) {
          const general = data.find((c: any) => c.name === 'General');
          setNewPostCategory(general ? general.id : data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };



  const handleAddPost = async () => {
    if (!newPostContent.trim()) return;
    setIsAddingPost(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          likes: Number(newPostLikes),
          retweets: Number(newPostRetweets),
          categoryId: newPostCategory,
          postedAt: newPostDate,
        }),
      });
      if (res.ok) {
        setNewPostContent('');
        setNewPostLikes(0);
        setNewPostRetweets(0);
        const general = categories.find(c => c.name === 'General');
        setNewPostCategory(general ? general.id : (categories[0]?.id || ''));
        setNewPostDate(getLocalDateString());
        setShowAddForm(false);
        fetchPosts();
        toast.success('Tweet saved to history successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to save tweet');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to save tweet');
    } finally {
      setIsAddingPost(false);
    }
  };

  const handleDeletePostClick = (id: string) => {
    setDeletePostId(id);
  };

  const executeDeletePost = async () => {
    if (!deletePostId) return;
    setIsDeletingPostState(true);
    try {
      const res = await fetch(`/api/posts?id=${deletePostId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPosts();
        toast.success('Post deleted from history successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete post');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete post');
    } finally {
      setIsDeletingPostState(false);
      setDeletePostId(null);
    }
  };

  const handleStartEdit = (post: Post) => {
    setEditingId(post.id);
    setEditContent(post.content);
    setEditLikes(post.likes);
    setEditRetweets(post.retweets);
    setEditCategory(post.categoryId);
    try {
      const dateVal = new Date(post.postedAt).toISOString().split('T')[0];
      setEditDate(dateVal);
    } catch {
      setEditDate(getLocalDateString());
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          content: editContent,
          likes: Number(editLikes),
          retweets: Number(editRetweets),
          categoryId: editCategory,
          postedAt: editDate,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchPosts();
        toast.success('Post updated successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to update post');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update post');
    } finally {
      setSavingEdit(false);
    }
  };

  // Format date in UTC to prevent timezone shifts
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Filter posts within range
  const filteredPostsInRange = posts.filter((post) => {
    const postDateStr = new Date(post.postedAt).toISOString().split('T')[0];
    if (filterStart && postDateStr < filterStart) return false;
    if (filterEnd && postDateStr > filterEnd) return false;
    return true;
  });

  // Copy range logic
  const handleCopyRange = async () => {
    if (filteredPostsInRange.length === 0) return;

    const textBlock = filteredPostsInRange
      .map((post) => {
        const formattedDate = formatDate(post.postedAt);
        return `Date: ${formattedDate}\n${post.content}`;
      })
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(textBlock);
      setCopiedRange(true);
      setTimeout(() => setCopiedRange(false), 2000);
      toast.success('Posts copied to clipboard!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">X Posts Memory</h2>
          <p className="text-sm text-neutral-400">Manage your historical tweets. The generator relies on these for style replication.</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          className="bg-neutral-900 border-[#27272a] text-white hover:bg-neutral-800 self-start sm:self-center"
        >
          {showAddForm ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Close Creator
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Saved Tweet
            </>
          )}
        </Button>
      </div>

      {/* Add Tweet to History Form (Collapsible) */}
      {showAddForm && (
        <Card className="bg-[#18181b] border-[#27272a] text-white animate-in slide-in-from-top-3 duration-200">
          <CardHeader className="pb-3 border-b border-[#27272a]/60">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Add Tweet to Memory</CardTitle>
            <CardDescription className="text-xs text-neutral-400">Save a high-performing post to feed the style-matching generator.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tweet Copy</Label>
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Paste the tweet content exactly as published..."
                className="bg-[#09090b] border-[#27272a] focus:border-blue-500 h-24 placeholder:text-neutral-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Likes Count</Label>
                <Input
                  type="number"
                  value={newPostLikes}
                  onChange={(e) => setNewPostLikes(Number(e.target.value))}
                  className="bg-[#09090b] border-[#27272a] focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Retweets Count</Label>
                <Input
                  type="number"
                  value={newPostRetweets}
                  onChange={(e) => setNewPostRetweets(Number(e.target.value))}
                  className="bg-[#09090b] border-[#27272a] focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Category</Label>
                <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                  <SelectTrigger className="w-full bg-[#09090b] border-[#27272a] h-10 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-[#27272a] text-white">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Published on X</Label>
                <Input
                  type="date"
                  value={newPostDate}
                  onChange={(e) => setNewPostDate(e.target.value)}
                  className="bg-[#09090b] border-[#27272a] focus:border-blue-500 text-white [color-scheme:dark]"
                />
              </div>
            </div>

            <Button
              onClick={handleAddPost}
              disabled={isAddingPost || !newPostContent.trim()}
              className="w-full flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Tweet to Database
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Date Range Exporter Panel */}
      <Card className="bg-[#18181b] border-[#27272a] text-white">
        <CardHeader className="pb-2 border-b border-[#27272a]/60">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Copy className="h-4 w-4 text-blue-500" />
            Export Posts by Date Range
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Select a date range to filter and copy posts formatted with publication dates.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Start Date</Label>
              <Input
                type="date"
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
                className="bg-[#09090b] border-[#27272a] text-white [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">End Date</Label>
              <Input
                type="date"
                value={filterEnd}
                onChange={(e) => setFilterEnd(e.target.value)}
                className="bg-[#09090b] border-[#27272a] text-white [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#27272a]/40">
            <span className="text-xs text-neutral-400 font-medium">
              {filteredPostsInRange.length} posts found in range
            </span>
            <Button
              onClick={handleCopyRange}
              disabled={filteredPostsInRange.length === 0}
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5"
            >
              {copiedRange ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-white" />
                  Copy Posts in Range
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List Saved Tweets */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-neutral-300">Saved X Timeline ({posts.length})</h3>

        {loadingPosts ? (
          <div className="text-center py-10 text-neutral-500">Loading your timeline history...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[#27272a] rounded-xl text-neutral-500 text-sm">
            No posts added yet. Click &quot;Add Saved Tweet&quot; above to record your history!
          </div>
        ) : (
          <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#18181b]/20 divide-y divide-[#27272a]">
            {posts.map((post) => {
              const isEditing = editingId === post.id;
              const displayName = xUsername ? xUsername.charAt(0).toUpperCase() + xUsername.slice(1) : 'X-Reply User';

              return (
                <div
                  key={post.id}
                  className={`p-4 transition-all duration-200 ${isEditing ? 'bg-blue-950/10' : 'hover:bg-neutral-900/20'}`}
                >
                  {isEditing ? (
                    <div className="space-y-4 w-full">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Edit Tweet Copy</Label>
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="bg-[#09090b] border-[#27272a] focus:border-blue-500 min-h-[90px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-neutral-400">Likes</Label>
                          <Input
                            type="number"
                            value={editLikes}
                            onChange={(e) => setEditLikes(Number(e.target.value))}
                            className="bg-[#09090b] border-[#27272a] h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-neutral-400">Retweets</Label>
                          <Input
                            type="number"
                            value={editRetweets}
                            onChange={(e) => setEditRetweets(Number(e.target.value))}
                            className="bg-[#09090b] border-[#27272a] h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-neutral-400">Category</Label>
                          <Select value={editCategory} onValueChange={setEditCategory}>
                            <SelectTrigger className="w-full bg-[#09090b] border-[#27272a] h-9 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#18181b] border-[#27272a] text-white">
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-neutral-400">Date on X</Label>
                          <Input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="bg-[#09090b] border-[#27272a] h-9 text-xs text-white [color-scheme:dark]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]/60">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(post.id)}
                          disabled={savingEdit || !editContent.trim()}
                          className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          {savingEdit ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* X-style Tweet Layout */
                    <div className="flex gap-3">
                      {/* Left Column: Avatar */}
                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-full bg-neutral-800 border border-[#27272a] flex items-center justify-center font-bold text-white text-sm select-none">
                          {xUsername ? xUsername.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </div>

                      {/* Right Column: Tweet details */}
                      <div className="flex-1 min-w-0">
                        {/* Header Info */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Display Name */}
                            <span className="font-bold text-white text-[15px] hover:underline cursor-pointer">
                              {displayName}
                            </span>
                            {/* Verified Check Badge */}
                            <BadgeCheck className="h-4 w-4 text-[#1d9bf0] fill-[#1d9bf0]" />
                            {/* X handle */}
                            <span className="text-neutral-500 text-sm">
                              @{xUsername || 'xusername'}
                            </span>
                            <span className="text-neutral-500 text-sm select-none">·</span>
                            {/* Date */}
                            <span className="text-neutral-500 text-sm hover:underline cursor-pointer">
                              {formatDate(post.postedAt)}
                            </span>

                            {/* Category tag */}
                            {post.category && (
                              <span className="ml-2 text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                                {post.category.name}
                              </span>
                            )}
                          </div>

                          {/* Option Controls */}
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(post)}
                              className="text-neutral-500 hover:text-[#1d9bf0] hover:bg-neutral-800/40 h-8 w-8 rounded-full transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePostClick(post.id)}
                              className="text-neutral-500 hover:text-red-500 hover:bg-red-950/20 h-8 w-8 rounded-full transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
 
                        {/* Body Copy */}
                        <p className="mt-1.5 text-[15px] text-white whitespace-pre-wrap leading-normal font-normal">
                          {post.content}
                        </p>
 
                        {/* X-style engagement bar */}
                        <div className="flex items-center justify-between text-neutral-500 text-[13px] mt-4 pt-1.5 max-w-md select-none border-t border-[#27272a]/30">
                          {/* Comment icon */}
                          <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] group transition-colors">
                            <div className="p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                              <MessageCircle className="h-4 w-4" />
                            </div>
                            <span className="text-[12px]">{Math.floor(post.likes / 5) || 2}</span>
                          </button>
 
                          {/* Repost/Retweet icon */}
                          <button className="flex items-center gap-1.5 hover:text-[#00ba7c] group transition-colors">
                            <div className="p-1.5 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                              <Repeat className="h-4 w-4" />
                            </div>
                            <span className="text-[12px]">{post.retweets}</span>
                          </button>
 
                          {/* Like icon */}
                          <button className="flex items-center gap-1.5 hover:text-[#f91880] group transition-colors">
                            <div className="p-1.5 rounded-full group-hover:bg-[#f91880]/10 transition-colors">
                              <Heart className="h-4 w-4" />
                            </div>
                            <span className="text-[12px]">{post.likes}</span>
                          </button>
 
                          {/* Share icon */}
                          <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] group transition-colors">
                            <div className="p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                              <Share className="h-4 w-4" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={deletePostId !== null} onOpenChange={(open) => { if (!open && !isDeletingPostState) setDeletePostId(null); }}>
        <AlertDialogContent className="bg-[#18181b] border border-[#27272a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Post from Memory</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete this post from history? This cannot be undone and will remove it from the generator style memory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeletingPostState}
              className="bg-neutral-850 border-[#27272a] text-white hover:bg-neutral-800"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeletingPostState}
              onClick={executeDeletePost}
            >
              {isDeletingPostState ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
