import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAccounts, addAccount, removeAccount } from '@/lib/kv';

// アカウント一覧取得
export async function GET() {
  try {
    const accounts = await getAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error getting accounts:', error);
    return NextResponse.json({ error: 'Failed to get accounts' }, { status: 500 });
  }
}

// アカウント追加
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // 管理者パスワード検証
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, adminPassword) || password === adminPassword;
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      );
    }

    // ユーザー名の形式チェック（@を除去）
    const cleanUsername = username.replace('@', '');
    
    try {
      await addAccount(cleanUsername);
      return NextResponse.json({ 
        message: 'Account added successfully (Note: Edge Config is read-only, accounts are managed via dashboard)',
        username: cleanUsername
      });
    } catch (addError) {
      return NextResponse.json({
        error: 'Edge Config is read-only. Please add accounts via Vercel dashboard in Edge Config settings.',
        instruction: 'Go to Vercel Dashboard > Your Project > Storage > Edge Config > Edit Config'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error adding account:', error);
    return NextResponse.json(
      { error: 'Failed to add account' },
      { status: 500 }
    );
  }
}

// アカウント削除
export async function DELETE(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // 管理者パスワード検証
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, adminPassword) || password === adminPassword;
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      );
    }

    const cleanUsername = username.replace('@', '');
    
    try {
      await removeAccount(cleanUsername);
      return NextResponse.json({ 
        message: 'Account removed successfully',
        username: cleanUsername
      });
    } catch (removeError) {
      return NextResponse.json({
        error: 'Edge Config is read-only. Please remove accounts via Vercel dashboard in Edge Config settings.',
        instruction: 'Go to Vercel Dashboard > Your Project > Storage > Edge Config > Edit Config'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error removing account:', error);
    return NextResponse.json(
      { error: 'Failed to remove account' },
      { status: 500 }
    );
  }
}
