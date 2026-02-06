"use client";

interface Screen {
  name: string;
  path: string;
  description: string;
  roles: string[];
  notes?: string;
}

interface Section {
  section: string;
  screens: Screen[];
}

interface Action {
  name: string;
  description?: string;
  roles: string[];
  notes?: string;
}

interface ActionSection {
  section: string;
  actions: Action[];
}

const ROLES = [
  { id: "super_admin", name: "Super Admin", color: "bg-purple-100 text-purple-700" },
  { id: "admin", name: "Admin", color: "bg-blue-100 text-blue-700" },
  { id: "agent", name: "Agente", color: "bg-emerald-100 text-emerald-700" },
];

const SCREENS: Section[] = [
  {
    section: "Panel Principal",
    screens: [
      {
        name: "Dashboard",
        path: "/admin",
        description: "Vista general de estadísticas y métricas",
        roles: ["super_admin", "admin", "agent"],
      },
    ],
  },
  {
    section: "Gestión de Proyectos",
    screens: [
      {
        name: "Proyectos",
        path: "/admin/proyectos",
        description: "CRUD completo de proyectos y sus lotes",
        roles: ["super_admin", "admin"],
      },
      {
        name: "Mis Proyectos",
        path: "/admin/mis-proyectos",
        description: "Ver y gestionar lotes de proyectos asignados",
        roles: ["agent"],
      },
    ],
  },
  {
    section: "Gestión de Leads",
    screens: [
      {
        name: "Leads",
        path: "/admin/leads",
        description: "Ver y gestionar leads de clientes potenciales",
        roles: ["super_admin", "admin", "agent"],
        notes: "Agentes solo ven leads asignados a ellos",
      },
    ],
  },
  {
    section: "Reportes y Métricas",
    screens: [
      {
        name: "Reportes",
        path: "/admin/reportes",
        description: "Métricas de ventas, proyectos y agentes",
        roles: ["super_admin", "admin"],
      },
    ],
  },
  {
    section: "Administración",
    screens: [
      {
        name: "Usuarios",
        path: "/admin/usuarios",
        description: "Gestión de usuarios y roles del sistema",
        roles: ["super_admin"],
      },
      {
        name: "Asignaciones",
        path: "/admin/asignaciones",
        description: "Asignar proyectos a agentes",
        roles: ["super_admin", "admin"],
      },
      {
        name: "Revisiones",
        path: "/admin/revisiones",
        description: "Aprobar/rechazar solicitudes de reversión de ventas",
        roles: ["super_admin", "admin"],
      },
      {
        name: "Configuración",
        path: "/admin/configuracion",
        description: "Configuración general del sistema",
        roles: ["super_admin", "admin"],
      },
    ],
  },
];

const ACTIONS: ActionSection[] = [
  {
    section: "Lotes",
    actions: [
      {
        name: "Cambiar estado de lote",
        description: "Disponible ↔ Reservado ↔ Vendido",
        roles: ["super_admin", "admin", "agent"],
        notes: "Agentes solo en proyectos asignados",
      },
      {
        name: "Revertir venta directamente",
        description: "Cambiar de Vendido a Disponible",
        roles: ["super_admin", "admin"],
      },
      {
        name: "Solicitar revisión de venta",
        description: "Enviar lote vendido a revisión",
        roles: ["agent"],
      },
      {
        name: "Aprobar reversión de venta",
        description: "Aprobar solicitudes de agentes",
        roles: ["super_admin", "admin"],
      },
    ],
  },
  {
    section: "Proyectos",
    actions: [
      {
        name: "Crear proyecto",
        roles: ["super_admin", "admin"],
      },
      {
        name: "Editar proyecto",
        roles: ["super_admin", "admin"],
      },
      {
        name: "Eliminar proyecto",
        roles: ["super_admin"],
      },
    ],
  },
  {
    section: "Usuarios",
    actions: [
      {
        name: "Ver usuarios",
        roles: ["super_admin"],
      },
      {
        name: "Cambiar rol de usuario",
        roles: ["super_admin"],
      },
      {
        name: "Activar/desactivar usuario",
        roles: ["super_admin"],
      },
    ],
  },
];

export default function PermisosPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Permisos por Rol</h1>
        <p className="text-gray-500 mt-1">
          Referencia de acceso a pantallas y acciones por tipo de usuario
        </p>
      </div>

      {/* Roles Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Roles del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLES.map((role) => (
            <div key={role.id} className="p-4 border border-gray-200 rounded-lg">
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${role.color}`}>
                {role.name}
              </span>
              <p className="mt-2 text-sm text-gray-600">
                {role.id === "super_admin" && "Acceso total al sistema. Puede gestionar usuarios y configuración."}
                {role.id === "admin" && "Gestiona proyectos, leads y reportes. No puede modificar usuarios."}
                {role.id === "agent" && "Solo ve y gestiona los proyectos y leads asignados."}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Screen Access */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acceso a Pantallas</h2>
        <div className="space-y-6">
          {SCREENS.map((section) => (
            <div key={section.section}>
              <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">{section.section}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Pantalla</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Ruta</th>
                      {ROLES.map((role) => (
                        <th key={role.id} className="text-center py-2 px-3 text-xs font-medium text-gray-500">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.screens.map((screen) => (
                      <tr key={screen.path} className="border-t border-gray-100">
                        <td className="py-3 px-3">
                          <p className="font-medium text-gray-900">{screen.name}</p>
                          <p className="text-xs text-gray-500">{screen.description}</p>
                          {screen.notes && (
                            <p className="text-xs text-amber-600 mt-1">⚠️ {screen.notes}</p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs font-mono text-gray-500">{screen.path}</td>
                        {ROLES.map((role) => (
                          <td key={role.id} className="py-3 px-3 text-center">
                            {screen.roles.includes(role.id) ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full">
                                ✕
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Permissions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Permisos de Acciones</h2>
        <div className="space-y-6">
          {ACTIONS.map((section) => (
            <div key={section.section}>
              <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">{section.section}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Acción</th>
                      {ROLES.map((role) => (
                        <th key={role.id} className="text-center py-2 px-3 text-xs font-medium text-gray-500">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.actions.map((action) => (
                      <tr key={action.name} className="border-t border-gray-100">
                        <td className="py-3 px-3">
                          <p className="font-medium text-gray-900">{action.name}</p>
                          {action.description && (
                            <p className="text-xs text-gray-500">{action.description}</p>
                          )}
                          {action.notes && (
                            <p className="text-xs text-amber-600 mt-1">⚠️ {action.notes}</p>
                          )}
                        </td>
                        {ROLES.map((role) => (
                          <td key={role.id} className="py-3 px-3 text-center">
                            {action.roles.includes(role.id) ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full">
                                ✕
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Notas Importantes</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Los agentes solo pueden ver y gestionar proyectos que les han sido asignados</li>
          <li>• Los agentes NO pueden revertir una venta directamente - deben solicitar revisión</li>
          <li>• Solo el Super Admin puede crear, modificar o desactivar usuarios</li>
          <li>• Los leads se filtran automáticamente según el rol del usuario</li>
        </ul>
      </div>
    </div>
  );
}
