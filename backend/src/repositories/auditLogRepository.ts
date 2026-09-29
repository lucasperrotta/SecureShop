import { query } from '../database/connection';

export class AuditLogRepository {
  // Criar log de auditoria
  async create( {
    action: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
    severity?: 'info' | 'warning' | 'critical';
  }): Promise<void> {
    await query(
      `INSERT INTO audit_logs (
        action, user_id, ip_address, user_agent, details, severity
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        data.action,
        data.userId || null,
        data.ipAddress || null,
        data.userAgent || null,
        data.details || null,
        data.severity || 'info',
      ]
    );
  }

  // Buscar logs por usuário
  async findByUserId(userId: string, limit: number = 50): Promise<any[]> {
    const result = await query(
      `SELECT * FROM audit_logs 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(this.mapRowToLog);
  }

  // Buscar logs por ação
  async findByAction(action: string, limit: number = 50): Promise<any[]> {
    const result = await query(
      `SELECT * FROM audit_logs 
      WHERE action = $1 
      ORDER BY created_at DESC 
      LIMIT $2`,
      [action, limit]
    );

    return result.rows.map(this.mapRowToLog);
  }

  // Buscar logs por severidade
  async findBySeverity(severity: string, limit: number = 50): Promise<any[]> {
    const result = await query(
      `SELECT * FROM audit_logs 
      WHERE severity = $1 
      ORDER BY created_at DESC 
      LIMIT $2`,
      [severity, limit]
    );

    return result.rows.map(this.mapRowToLog);
  }

  // Buscar logs recentes (todos)
  async findRecent(limit: number = 100): Promise<any[]> {
    const result = await query(
      `SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => ({
      ...this.mapRowToLog(row),
      userName: row.user_name,
      userEmail: row.user_email,
    }));
  }

  // Estatísticas de logs
  async getStats(): Promise<{
    totalLogs: number;
    criticalCount: number;
    warningCount: number;
    todayCount: number;
  }> {
    const result = await query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
        COUNT(*) FILTER (WHERE severity = 'warning') as warning_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count
      FROM audit_logs
    `);

    const row = result.rows[0];
    return {
      totalLogs: parseInt(row.total_logs),
      criticalCount: parseInt(row.critical_count),
      warningCount: parseInt(row.warning_count),
      todayCount: parseInt(row.today_count),
    };
  }

  // Limpar logs antigos (manter apenas últimos N dias)
  async cleanup(daysToKeep: number = 90): Promise<number> {
    const result = await query(
      `DELETE FROM audit_logs 
      WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'`,
      []
    );

    return result.rowCount || 0;
  }

  // Mapear row do banco para log
  private mapRowToLog(row: any) {
    return {
      id: row.id,
      action: row.action,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      details: row.details,
      severity: row.severity,
      createdAt: row.created_at,
    };
  }
}
