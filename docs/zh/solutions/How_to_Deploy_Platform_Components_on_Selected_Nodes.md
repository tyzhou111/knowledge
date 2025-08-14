---
id: KB1755151564-C9F6
products:
  - Alauda Container Platform
kind:
  - Solution
sourceSHA: 5500ea6474bcca57c6052d90a43bfcc9342aa26cce5e3a0d2e810c22a98e9b84
---

# 如何在选定节点上部署平台组件

## 问题

平台组件需要在专用节点上运行，以将其与应用工作负载隔离，从而为不同类型的工作负载提供差异化的资源分配和操作保障。

## 环境

v4.0.x

## 解决方案

### 1. 将以下标签添加到选定节点

```yaml
cpaas-system-alb: ""
node-role.kubernetes.io/cpaas-system: "true"
```

在业务集群上执行以下命令：

```shell
kubectl label nodes NODE_NAME cpaas-system-alb="" node-role.kubernetes.io/cpaas-system=true
```

### 2. 修改 ConfigMap cluster-module-config

将 globalConfig 和 platformConfig 下的 platformNodeSelector 内容更改为 '{"node-role.kubernetes.io/cpaas-system": "true"}'

在全球集群上执行以下命令：

```shell
kubectl edit configmaps -n cpaas-system cluster-module-config
```

参考以下内容进行修改：

```yaml
---
apiVersion: v1
data:
  config.yaml: |
    globalConfig: |
      global:
        ......

# 更改以下内容
        <<- if (and .IsGlobal .PlatformNodeSelector) >>
        nodeSelector:
          <<- range $key, $val := .PlatformNodeSelector >>
            << $key >>: << $val | quote >>
          <<- end >>
        <<- else >>
        nodeSelector: {}
        <<- end >>
# 更改为：
        nodeSelector:
          "node-role.kubernetes.io/cpaas-system": "true"
# 结束
        ......

    platformConfig: |
      global:
        ......
# 更改以下内容
        <<- if (and .IsGlobal .PlatformNodeSelector) >>
        nodeSelector:
          <<- range $key, $val := .PlatformNodeSelector >>
            << $key >>: << $val | quote >>
          <<- end >>
        <<- end >>
# 更改为：
        nodeSelector:
          "node-role.kubernetes.io/cpaas-system": "true"
# 结束
    ......
```

### 3. 等待业务集群上的所有组件完全更新

使用以下命令检查业务集群的状态：

```shell
kubectl get appreleases -n cpaas-system -w
```

### 4. 重新调度 alb

通常，alb 标签会添加到控制平面节点。使用以下命令从业务集群的控制平面节点中移除该标签：

```shell
kubectl label nodes NODE_NAME cpaas-system-alb-
```

使用以下命令重启业务集群上的所有 alb Pods：

```shell
kubectl delete pods -n cpaas-system -l service_name=alb2-cpaas-system
```

如果使用外部负载均衡器代理端口 11780，则外部负载均衡器的后端服务器配置也必须更新以包含新节点。

### 5. 验证

在业务集群上执行以下命令以验证 Pods 是否已重新调度到指定节点：

```shell
kubectl get pods -n cpaas-system -o wide
kubectl get pods -n cert-manager -o wide
```

输出示例如下所示。请确保 NODE 列中的值符合预期。

```shell
NAME                                       READY   STATUS    RESTARTS   AGE    IP           NODE             NOMINATED NODE   READINESS GATES
cert-manager-697748f676-lslwc              1/1     Running   0          6d2h   10.3.241.4   192.168.137.44   <none>           <none>
cert-manager-cainjector-86c5cddcf4-vct7k   1/1     Running   0          6d2h   10.3.241.3   192.168.137.44   <none>           <none>
cert-manager-webhook-b84f578c4-vzsdd       1/1     Running   0          6d2h   10.3.241.2   192.168.137.44   <none>           <none>
```
